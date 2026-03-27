import md5 from 'md5';
import { sendMessage } from '../wext';
import { ROUTES } from '../constants';

// 1688 MTOP API 상수
const MTOP_APP_KEY = '12574478';
const IMAGE_UPLOAD_APP_KEY = 'pvvljh1grxcmaay2vgpe9nb68gg9ueg2';
const MTOP_JSV = '2.7.2';
const MTOP_UPLOAD_URL = 'https://h5api.m.1688.com/h5/mtop.1688.imageservice.putimage/1.0/';
const SEARCH_URL = 'https://search.1688.com/service/imageSearchOfferResultViewService';
const TOKEN_COOKIE = '_m_h5_tk';

/**
 * 1688 이미지 검색 메인 함수
 * @param {string} imageDataUrl - base64 이미지 dataURL
 * @returns {Promise<Array>} 검색 결과 배열
 */
export async function search1688ByImage(imageDataUrl) {
  // 1. 토큰 획득 (_m_h5_tk 쿠키)
  const token = await getToken();
  if (!token) {
    console.warn('[1688] 토큰 없음 — 1688.com 방문 필요');
    // 토큰 없이 대체 방식 시도
    return await searchViaOpenService(imageDataUrl);
  }

  // 2. MTOP API로 이미지 업로드
  const uploadResult = await uploadImageMtop(imageDataUrl, token);
  if (!uploadResult) {
    // 업로드 실패 시 대체 방식
    return await searchViaOpenService(imageDataUrl);
  }

  // 3. 검색 결과 조회
  const results = await fetchSearchResults(uploadResult);
  return results;
}

/**
 * 1688 _m_h5_tk 쿠키에서 토큰 추출
 */
async function getToken() {
  try {
    console.log('[1688] 토큰 획득 시도...');
    const cookies = await sendMessage(ROUTES.COOKIES_GET_ALL, {
      url: 'https://www.1688.com',
    });

    console.log('[1688] 쿠키 조회 결과:', cookies ? cookies.length + '개' : 'null');

    if (!cookies || !Array.isArray(cookies)) return null;

    const tkCookie = cookies.find(c => c.name === TOKEN_COOKIE);
    if (!tkCookie) {
      console.log('[1688] _m_h5_tk 쿠키 없음 — 1688.com 방문 필요');
      return null;
    }

    // 형식: token_timestamp → 앞부분만 사용
    const token = decodeURIComponent(tkCookie.value.trim().split('_')[0] || '');
    console.log('[1688] 토큰 획득 성공:', token ? token.substring(0, 8) + '...' : 'empty');
    return token || null;
  } catch (err) {
    console.error('[1688] 토큰 획득 실패:', err);
    return null;
  }
}

/**
 * MTOP API로 이미지 업로드
 * @param {string} imageDataUrl - base64 dataURL
 * @param {string} token - _m_h5_tk 토큰
 * @returns {Promise<{imageId, sessionId, requestId}|null>}
 */
async function uploadImageMtop(imageDataUrl, token) {
  try {
    // base64 prefix 제거 (data:image/jpeg;base64, 부분)
    const base64Data = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

    const timestamp = Date.now().toString();

    // 요청 바디
    const bodyData = JSON.stringify({
      imageBase64: base64Data,
      appName: 'searchImageUpload',
      appKey: IMAGE_UPLOAD_APP_KEY,
    });

    // MD5 서명 생성: MD5(token + "&" + timestamp + "&" + appKey + "&" + body)
    const signStr = `${token}&${timestamp}&${MTOP_APP_KEY}&${bodyData}`;
    const sign = md5(signStr);

    // URL 파라미터 구성
    const params = new URLSearchParams({
      jsv: MTOP_JSV,
      appKey: MTOP_APP_KEY,
      t: timestamp,
      sign: sign,
      api: 'mtop.1688.imageService.putImage',
      ecode: '0',
      v: '1.0',
      type: 'originaljson',
      dataType: 'json',
    });

    const url = `${MTOP_UPLOAD_URL}?${params.toString()}`;

    console.log('[1688] MTOP 업로드 요청 전송...');

    // background 프록시로 요청 (CORS 우회)
    const response = await sendMessage(ROUTES.REQUEST, {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: `data=${encodeURIComponent(bodyData)}`,
    });

    console.log('[1688] MTOP 응답 상태:', response?.status, response?.ok);

    if (!response || !response.ok) {
      console.error('[1688] 이미지 업로드 실패:', response?.status, response?.error);
      return null;
    }

    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    console.log('[1688] MTOP 응답 데이터:', JSON.stringify(data).substring(0, 300));

    // 응답 검증 — ret 배열 확인
    const retData = data?.data || data?.ret?.[0];
    if (!data?.data && !retData) {
      console.error('[1688] 업로드 응답 형식 오류:', Object.keys(data || {}));
      return null;
    }

    const result = data.data || {};
    if (!result.imageId && !result.sessionId) {
      console.error('[1688] 업로드 결과에 imageId/sessionId 없음:', Object.keys(result));
      return null;
    }

    return {
      imageId: result.imageId || '',
      sessionId: result.sessionId || '',
      requestId: result.requestId || '',
    };
  } catch (err) {
    console.error('[1688] MTOP 업로드 에러:', err);
    return null;
  }
}

/**
 * 검색 결과 조회
 * @param {{imageId, sessionId, requestId}} uploadResult
 * @returns {Promise<Array>} 정규화된 검색 결과
 */
async function fetchSearchResults(uploadResult) {
  try {
    const { imageId, sessionId, requestId } = uploadResult;
    console.log('[1688] 검색 요청 시작...', { imageId, sessionId, requestId });

    const params = new URLSearchParams({
      tab: 'imageSearch',
      imageId: imageId,
      imageIdList: imageId,
      filt: 'y',
      beginPage: '1',
      pageSize: '40',
      pageName: 'image',
      requestId: requestId,
      sessionId: sessionId,
    });

    const url = `${SEARCH_URL}?${params.toString()}`;
    console.log('[1688] 검색 URL:', url.substring(0, 150) + '...');

    const response = await sendMessage(ROUTES.REQUEST, {
      url,
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
    });

    console.log('[1688] 검색 응답 상태:', response?.status, response?.ok);

    if (!response || !response.ok) {
      console.error('[1688] 검색 요청 실패:', response?.status, response?.error);
      return [];
    }

    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    console.log('[1688] 검색 응답 키:', data ? Object.keys(data) : 'null');
    if (data?.data) {
      console.log('[1688] 검색 data.data 키:', Object.keys(data.data));
    }

    // 응답 구조 유연하게 파싱 (여러 형태 대응)
    let offerList = null;

    if (data?.data?.data?.offerList) {
      offerList = data.data.data.offerList;
    } else if (data?.data?.offerList) {
      offerList = data.data.offerList;
    } else if (data?.offerList) {
      offerList = data.offerList;
    }

    // offerList가 없으면 data 안에서 배열 찾기
    if (!offerList) {
      const searchIn = data?.data?.data || data?.data || data;
      if (searchIn) {
        for (const key of Object.keys(searchIn)) {
          if (Array.isArray(searchIn[key]) && searchIn[key].length > 0 && searchIn[key][0].offerId) {
            offerList = searchIn[key];
            console.log(`[1688] offerList를 "${key}" 키에서 발견`);
            break;
          }
        }
      }
    }

    if (!offerList || offerList.length === 0) {
      console.log('[1688] 검색 결과 없음. 응답 구조:', JSON.stringify(data).substring(0, 500));
      return [];
    }

    console.log(`[1688] 검색 결과: ${offerList.length}건`);
    // 첫 번째 아이템 구조 확인
    if (offerList.length > 0) {
      console.log('[1688] 첫 아이템 키:', Object.keys(offerList[0]));
      console.log('[1688] 첫 아이템 샘플:', JSON.stringify(offerList[0]).substring(0, 800));
    }
    return normalizeResults(offerList);
  } catch (err) {
    console.error('[1688] 검색 에러:', err);
    return [];
  }
}

/**
 * 대체 방식: open-s.alibaba.com 서비스로 검색 (토큰 불필요)
 */
async function searchViaOpenService(imageDataUrl) {
  console.log('[1688] 대체 방식 (OpenService) 시도...');
  try {
    const response = await sendMessage(ROUTES.UPLOAD_PROXY, {
      url: 'https://open-s.alibaba.com/openservice/imageSearchOfferResultViewService',
      method: 'POST',
      formData: {
        image: { dataUrl: imageDataUrl, filename: 'search.jpg' },
      },
      headers: {
        'Referer': 'https://s.1688.com/',
        'Origin': 'https://s.1688.com',
      },
    });

    console.log('[1688] OpenService 응답:', response ? response.status : 'null');

    if (!response || !response.ok) {
      console.error('[1688] OpenService 실패:', response?.status, response?.error);
      return [];
    }

    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    console.log('[1688] OpenService 데이터 키:', data ? Object.keys(data) : 'null');

    // 응답 구조가 다양할 수 있음
    let offerList = null;
    if (data?.data?.offerList) {
      offerList = data.data.offerList;
    } else if (data?.data?.data?.offerList) {
      offerList = data.data.data.offerList;
    } else if (data?.offerList) {
      offerList = data.offerList;
    }

    if (offerList && offerList.length > 0) {
      console.log(`[1688] OpenService 결과: ${offerList.length}건`);
      return normalizeResults(offerList);
    }

    console.log('[1688] OpenService 결과 없음');
    return [];
  } catch (err) {
    console.error('[1688] OpenService 에러:', err);
    return [];
  }
}

/**
 * 1688 검색 결과를 표준 형식으로 변환
 */
function normalizeResults(offerList) {
  return offerList.map(item => {
    try {
      // ID 처리 (id 또는 offerId)
      const offerId = String(item.id || item.offerId || item.infoId || '');

      // 제목 처리
      const info = item.information || {};
      let title = info.subject || info.title || item.subject || item.title || item.offerTitle || '';
      // HTML 태그 제거
      title = title.replace(/<[^>]*>/g, '');

      // 가격 처리
      let price = '';
      const tp = item.tradePrice || {};
      if (tp.offerPrice) {
        price = `¥${tp.offerPrice}`;
      } else if (tp.price) {
        price = `¥${tp.price}`;
      } else if (item.priceDisplay) {
        price = item.priceDisplay;
      } else if (item.price) {
        price = `¥${item.price}`;
      }

      // 이미지 URL 처리
      let imageUrl = '';
      const img = item.image || {};
      if (typeof img === 'string') {
        imageUrl = img;
      } else if (img.imgUrl) {
        imageUrl = img.imgUrl;
      } else if (img.url) {
        imageUrl = img.url;
      } else if (Array.isArray(img.imgList) && img.imgList.length > 0) {
        imageUrl = img.imgList[0];
      } else if (item.imgUrl) {
        imageUrl = item.imgUrl;
      } else if (item.imageUrl) {
        imageUrl = item.imageUrl;
      }
      imageUrl = String(imageUrl || '');
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = 'https:' + imageUrl;
      }

      // 상품 URL 처리
      let productUrl = '';
      if (offerId) {
        productUrl = `https://detail.1688.com/offer/${offerId}.html`;
      } else if (info.detailUrl) {
        productUrl = info.detailUrl;
      } else if (item.detailUrl) {
        productUrl = item.detailUrl;
      }

      // 회사명
      const company = item.company || '';
      let shopName = '';
      if (typeof company === 'string') {
        shopName = company;
      } else if (company.name) {
        shopName = company.name;
      }

      return {
        title,
        price,
        imageUrl,
        productUrl,
        platform: '1688',
        offerId,
        shopName,
        moq: item.tradeQuantity?.quantityBegin || '',
        location: item.industrialBelt?.provinceName || '',
      };
    } catch (e) {
      console.warn('[1688] 아이템 파싱 에러:', e.message);
      return null;
    }
  }).filter(item => item && (item.title || item.offerId) && item.productUrl);
}
