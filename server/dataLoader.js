const mongoose = require('mongoose');
const axios = require('axios');
const xml2js = require('xml2js');
const { ObjectLost } = require('./models/objectLost');
const { ObjectGet } = require('./models/objectGet');
const { AnimalLost } = require('./models/animalLost');
const { AnimalGet } = require('./models/animalGet');
const parser = new xml2js.Parser({
    explicitArray: false,  // 배열 대신 객체로
    trim: true,            // CDATA나 공백 잘라냄
  });
require('dotenv').config()

let numOfRows = 100;
let initMax = 1000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('DB 연결 성공');
    } catch (err) {
        console.error('DB 연결 실패:', err);
        throw err;
    }
}

async function fetchLostAnimalPage(pageNo, numOfRows, startDate, endDate) {
    const url = 'https://apis.data.go.kr/1543061/lossInfoService/lossInfo';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.PUBLIC_DATA_API_KEY;
    queryParams += '&' + encodeURIComponent('bgnde') + '=' + encodeURIComponent(startDate);
    queryParams += '&' + encodeURIComponent('endde') + '=' + encodeURIComponent(endDate);
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent(pageNo);
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent(numOfRows);
    queryParams += '&' + encodeURIComponent('_type') + '=' + encodeURIComponent('xml');
    try {
        const response = await axios.get(url + queryParams);
        const parsed = await parser.parseStringPromise(response.data); // 👈 XML → JSON 파싱
        return parsed;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

async function fetchGetAnimalPage(pageNo, numOfRows) {
    const url = 'https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.PUBLIC_DATA_API_KEY;
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent(pageNo);
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent(numOfRows);
    try {
        const response = await axios.get(url + queryParams);
        const parsed = await parser.parseStringPromise(response.data); // 👈 XML → JSON 파싱
        return parsed;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

async function fetchLostObjectPage(pageNo, numOfRows) {
    const url = 'http://apis.data.go.kr/1320000/LostGoodsInfoInqireService/getLostGoodsInfoAccToClAreaPd';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.PUBLIC_DATA_API_KEY;
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent(pageNo);
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent(numOfRows); 

    try {
        const response = await axios.get(url + queryParams);
        return response.data;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

async function fetchLostObjectDetail(atcId) {
    const url = 'http://apis.data.go.kr/1320000/LostGoodsInfoInqireService/getLostGoodsDetailInfo';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.PUBLIC_DATA_API_KEY;
    queryParams += '&' + encodeURIComponent('ATC_ID') + '=' + encodeURIComponent(atcId);

    try {
        const response = await axios.get(url + queryParams);
        return response.data;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

async function fetchPoliceGetObjectPage(pageNo, numOfRows) {
    const url = 'http://apis.data.go.kr/1320000/LosfundInfoInqireService/getLosfundInfoAccToClAreaPd';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.PUBLIC_DATA_API_KEY;
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent(pageNo);
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent(numOfRows); 

    try {
        const response = await axios.get(url + queryParams);
        return response.data;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

async function fetchPoliceGetObjectDetail(atcId) {
    const url = 'http://apis.data.go.kr/1320000/LosfundInfoInqireService/getLosfundDetailInfo';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.PUBLIC_DATA_API_KEY;
    queryParams += '&' + encodeURIComponent('ATC_ID') + '=' + encodeURIComponent(atcId);

    try {
        const response = await axios.get(url + queryParams);
        return response.data;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

async function fetchOrgGetObjectPage(pageNo, numOfRows) {
    const url = 'http://apis.data.go.kr/1320000/LosPtfundInfoInqireService/getPtLosfundInfoAccToClAreaPd';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.PUBLIC_DATA_API_KEY;
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent(pageNo);
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent(numOfRows); 

    try {
        const response = await axios.get(url + queryParams);
        return response.data;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

async function fetchOrgGetObjectDetail(atcId) {
    const url = 'http://apis.data.go.kr/1320000/LosPtfundInfoInqireService/getPtLosfundDetailInfo';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.PUBLIC_DATA_API_KEY;
    queryParams += '&' + encodeURIComponent('ATC_ID') + '=' + encodeURIComponent(atcId);

    try {
        const response = await axios.get(url + queryParams);
        return response.data;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

async function fetchAddress(place) {
    const url = 'https://business.juso.go.kr/addrlink/addrLinkApi.do';
    let queryParams = '?' + encodeURIComponent('confmKey') + '=' + process.env.ADDRESS_API_KEY;
    queryParams += '&' + encodeURIComponent('currentPage') + '=' + encodeURIComponent(1);
    queryParams += '&' + encodeURIComponent('countPerPage') + '=' + encodeURIComponent(1);
    queryParams += '&' + encodeURIComponent('keyword') + '=' + encodeURIComponent(place);
    try {
        const response = await axios.get(url + queryParams);
        const result = await parser.parseStringPromise(response.data);
        return result;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

function getLostAnimalDocument(item, si, sgg, emd){
    return {
        user_id: '분실동물',
        rfidCd: item.rfidCd,
        callName: item.callName,
        callTel: item.callTel,
        happenDt: item.happenDt,
        happenAddr: item.happenAddr,
        happenAddrDtl: item.happenAddrDtl,
        si: si,
        sgg: sgg,
        emd: emd,
        happenPlace: item.happenPlace,
        orgNm: item.orgNm,
        popfile: item.popfile,
        kindCd: item.kindCd,
        sexCd: item.sexCd,
        age: item.age,
        specialMark: item.specialMark,
        date: new Date()
    };
}

function getSavedAnimalDocument(item, si, sgg, emd){
    return {
        user_id: '구조동물',
        desertionNo: item.desertionNo,
        rfidCd: item.rfidCd,
        happenDt: item.happenDt,
        happenPlace: item.happenPlace,
        si: si,
        sgg: sgg,
        emd: emd,
        kindNm: item.kindNm,
        colorCd: item.colorCd,
        weight: item.weight,
        age: item.age,
        noticeNo: item.noticeNo,
        noticeSdt: item.noticeSdt,
        noticeEdt: item.noticeEdt,
        popfile1: item.popfile1,
        processState: item.processState,
        sexCd: item.sexCd,
        neuterYn: item.neuterYn,
        specialMark: item.specialMark,
        careRegNo: item.careRegNo,
        careNm: item.careNm,
        careTel: item.careTel,
        careAddr: item.careAddr,
        careOwnerNm: item.careOwnerNm,
        orgNm: item.orgNm, 
        date: new Date()
    };
}

function getLostObjectDocument(item, si, sgg, emd){
    return {
        user_id: '경찰청',
        atcId: item.atcId,
        lstPrdtNm: item.lstPrdtNm,
        lstYmd: new Date(item.lstYmd),
        lstHor: item.lstHor,
        lstPlace: item.lstPlace,
        si: si,
        sgg: sgg,
        emd: emd,
        prdtClNm: item.prdtClNm,
        lstSteNm: item.lstSteNm,
        uniq: item.uniq,
        lstLctNm: item.lstLctNm,
        lstSbjt: item.lstSbjt,
        orgId: item.orgId,
        orgNm: item.orgNm,
        tel: item.tel,
        lstPlaceSeNm: item.lstPlaceSeNm,
        lstFilePathImg: item.lstFilePathImg,
        date: new Date()
    };
}

function getPoliceFoundObjectDocument(item, si, sgg, emd) {
    return {
        user_id: '경찰청',
        atcId: item.atcId,
        fdPrdtNm: item.fdPrdtNm,
        fdYmd: item.fdYmd,
        si: si,
        sgg: sgg,
        emd: emd,
        fdSn: item.fdSn,
        prdtClNm: item.prdtClNm,
        depPlace: item.depPlace,
        fdFilePathImg: item.fdFilePathImg,
        clrNm : item.clrNm,
        fdsbjt: item.fdsbjt,
        date: new Date()
    };
}

function getOrgFoundObjectDocument(item, si, sgg, emd) {
    return {
        user_id: '포털기관',
        atcId: item.atcId,
        fdPrdtNm: item.fdPrdtNm,
        fdYmd: item.fdYmd,
        fdHor: item.fdHor,
        fdPlace: item.fdPlace,
        si: si,
        sgg: sgg,
        emd: emd,
        uniq: item.uniq,
        fdSn: item.fdSn,
        prdtClNm: item.prdtClNm,
        depPlace: item.depPlace,
        csteSteNm: item.csteSteNm,
        orgId: item.orgId,
        orgNm: item.orgNm,
        tel: item.tel,
        fndKeepOrgnSeNm: item.fndKeepOrgnSeNm,
        fdFilePathImg: item.fdFilePathImg,
        date: new Date()
    };
}

async function updateLostAnimalData() {
    const { bgnde, endde } = getYesterdayDateStrings();
    let documents = [];
    let pageNo = 1;
    let isDone = false;

    while (true) {
        console.log(`Lost Animal ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchLostAnimalPage, [pageNo, numOfRows, bgnde, endde]);

        console.log(`Lost Animal ${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        if (items.length === 0) {
            console.log('오늘 날짜 데이터 없음. 종료합니다.');
            break;
        }

        let cnt = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const { si, sgg, emd } = await parseAddressWithRetry(item.happenAddr);

            documents.push(getLostAnimalDocument(item, si, sgg, emd));
            cnt++;
        }

        console.log(`Lost Animal ${cnt}/${numOfRows} Loaded`);
        console.log(`Lost Animal ${pageNo} End`);

        if (items.length < numOfRows) {
            // 마지막 페이지 도달로 간주
            documents.reverse();
            await AnimalLost.insertMany(documents);
            console.log('데이터 수집 완료');
            break;
        }

        if (isDone) {
            // if (documents.length != 0)
            //     setLastAtcId(documents[0].atcId);
            documents.reverse();
            await AnimalLost.insertMany(documents);
            console.log('데이터 수집 완료');
            break;
        }

        await sleep(40);
        pageNo++;
    }
}

async function updateSavedAnimalData(lastDesertionNo) {
    let documents = [];
    let pageNo = 1;
    let isDone = false;

    while (true) {
        console.log(`Saved Animal ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchGetAnimalPage, [pageNo, numOfRows]);

        console.log(`Saved Animal ${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        let cnt = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item?.desertionNo?.trim() === lastDesertionNo?.trim()) {
                isDone = true;
                break;
            }
            const { si, sgg, emd } = await parseAddressWithRetry(item.careAddr);
            documents.push(getSavedAnimalDocument(item, si, sgg, emd));
            cnt++;
        }

        console.log(`Saved Animal ${cnt}/${numOfRows} Loaded`);
        console.log(`Saved Animal ${pageNo} End`);

        if (isDone) {
            documents.reverse();
            await AnimalGet.insertMany(documents);
            console.log('데이터 수집 완료');
            break;
        }

        await sleep(40);
        pageNo++;
    }
}

async function updateLostObjectData(lastAtcId) {
    let documents = [];
    let pageNo = 1;
    let isDone = false;

    while (true) {
        console.log(`Lost Object ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchLostObjectPage, [pageNo, numOfRows]);
        console.log(`Lost Object ${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const detailResult = await fetchUntilSuccess(fetchLostObjectDetail, [items[i].atcId]);
            await sleep(40);

            if (detailResult?.response?.body !== '') {
                const detailItem = detailResult.response.body.item;

                if (detailItem.atcId === lastAtcId) {
                    isDone = true;
                    break;
                }

                let si = '', sgg = '', emd = '';

                try {
                    const keyword = detailItem.orgNm.trim(); // ← 공백 제거
                    const addressRes = await fetchAddress(keyword);
                    const rawJuso = addressRes?.results?.juso;
                    const lstLctNm = detailItem.lstLctNm?.trim();

                    let juso = null;

                    if (Array.isArray(rawJuso) && rawJuso.length > 0) {
                        juso = rawJuso[0];
                    } else if (typeof rawJuso === 'object' && rawJuso !== null) {
                        juso = rawJuso;
                    }
                
                    const jusoSiNm = juso.siNm.trim();
                    if (juso && jusoSiNm === lstLctNm) {
                        si = juso.siNm || '';
                        sgg = juso.sggNm || '';
                        emd = juso.emdNm || '';
                    } else {
                        si = lstLctNm; // 주소 결과 없음이거나 시/도가 다르면 최소한 이것만 넣기
                        sgg = '';
                        emd = '';
                    }

                } catch (err) {
                    console.error(`❌ 주소 파싱 오류 (${detailItem.orgNm}):`, err.message);
                    si = detailItem.lstLctNm || ''; // 예외 시에도 최소한 시/도는 넣기
                    sgg = '';
                    emd = '';
                }

                cnt++;
                documents.push(getLostObjectDocument(detailItem,si,sgg,emd));
            }
        }

        console.log(`Lost Object ${cnt}/${numOfRows} Loaded`);
        console.log(`Lost Object ${pageNo} End`);

        if (isDone) {
            // if (documents.length != 0)
            //     setLastAtcId(documents[0].atcId);
            documents.reverse();
            await ObjectLost.insertMany(documents);
            console.log('데이터 수집 완료');
            break;
        }

        await sleep(40);
        pageNo++;
    }
}

async function updatePoliceFoundObjectData(lastAtcId) {
    let documents = [];
    let pageNo = 1;
    let isDone = false;

    while (true) {
        console.log(`Police Found Object ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchPoliceGetObjectPage, [pageNo, numOfRows]);
        console.log(`${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;
            
            if (item.atcId === lastAtcId) {
                    isDone = true;
                    break;
            }

            let si = '', sgg = '', emd = '';

            try {
                const keyword = item.depPlace.trim();
                const addressRes = await fetchAddress(keyword);
                const rawJuso = addressRes?.results?.juso;

                let juso = null;
                if (Array.isArray(rawJuso) && rawJuso.length > 0) {
                    juso = rawJuso[0];
                } else if (typeof rawJuso === 'object' && rawJuso !== null) {
                    juso = rawJuso;
                }

                si = juso.siNm || '';
                sgg = juso.sggNm || '';
                emd = juso.emdNm || '';

            } catch (err) {
                console.error(`❌ 습득 주소 파싱 오류 (${item.orgNm}):`, err.message);
            }

            documents.push(getPoliceFoundObjectDocument(item, si, sgg, emd));
            cnt++;
        }

        console.log(`Found Object ${cnt}/${numOfRows} Loaded`);
        console.log(`Found Object ${pageNo} End`);

        if (isDone) {
            documents.reverse();
            await ObjectGet.insertMany(documents);
            console.log('습득물 데이터 갱신 완료');
            break;
        }

        await sleep(40);
        pageNo++;
    }
}

async function updateOrgFoundObjectData(lastAtcId) {
    let documents = [];
    let pageNo = 1;
    let isDone = false;

    while (true) {
        console.log(`Org Found Object ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchOrgGetObjectPage, [pageNo, numOfRows]);

        console.log(`${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;

            if (item.atcId === lastAtcId) {
                    isDone = true;
                    break;
            }
            
            let si = '', sgg = '', emd = '';

            try {
                const keyword = item.depPlace.trim();
                const addressRes = await fetchAddress(keyword);
                const rawJuso = addressRes?.results?.juso;

                let juso = null;
                if (Array.isArray(rawJuso) && rawJuso.length > 0) {
                    juso = rawJuso[0];
                } else if (typeof rawJuso === 'object' && rawJuso !== null) {
                    juso = rawJuso;
                }

                si = juso.siNm || '';
                sgg = juso.sggNm || '';
                emd = juso.emdNm || '';
                
            } catch (err) {
                console.error(`❌ 습득 주소 파싱 오류 (${item.orgNm}):`, err.message);
            }

            documents.push(getOrgFoundObjectDocument(item, si, sgg, emd));
            cnt++;
        }

        console.log(`Found Object ${cnt}/${numOfRows} Loaded`);
        console.log(`Found Object ${pageNo} End`);

        if (isDone) {
            documents.reverse();
            await ObjectGet.insertMany(documents);
            console.log('습득물 데이터 갱신 완료');
            break;
        }

        await sleep(40);
        pageNo++;
    }
}

async function initLostAnimalData() {
    const { bgnde, endde } = getDateStrings();
    let documents = [];
    let totalCnt = 0;
    let pageNo = 1;

    while (true) {
        console.log(`Lost Animal ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchLostAnimalPage, [pageNo, numOfRows, bgnde, endde]);
        console.log(`Lost Animal ${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        if (items.length === 0) {
            console.log('📭 더 이상 불러올 데이터가 없습니다.');
            if (documents.length > 0) {
                documents.reverse();
                await AnimalLost.insertMany(documents);
                console.log(`✅ 총 ${totalCnt}건 저장 완료 (API 종료)`);
            }
            break;
        }

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const { si, sgg, emd } = await parseAddressWithRetry(item.happenAddr);
            documents.push(getLostAnimalDocument(item, si, sgg, emd));
            cnt++;
        }

        console.log(`Lost Animal ${cnt}/${numOfRows} Loaded`);
        totalCnt += cnt;

        if (totalCnt >= initMax || items.length < numOfRows) {
            documents.reverse();
            await AnimalLost.insertMany(documents);
            console.log(`✅ 총 ${totalCnt}건 저장 완료 (${totalCnt >= initMax ? 'initMax 도달' : '마지막 페이지'})`);
            break;
        }

        console.log(`Lost Animal ${pageNo} End`);
        await sleep(40);
        pageNo++;
    }
}

async function initGetAnimalData() {
    let documents = [];
    let totalCnt = 0;
    let pageNo = 1;

    while (true) {
        console.log(`Get Animal ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchGetAnimalPage, [pageNo, numOfRows]);

        console.log(`Get Animal ${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        if (items.length === 0) {
            console.log('📭 더 이상 불러올 데이터가 없습니다.');
            if (documents.length > 0) {
                documents.reverse();
                await AnimalGet.insertMany(documents);
                console.log(`✅ 총 ${totalCnt}건 저장 완료 (API 종료)`);
            }
            break;
        }

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const { si, sgg, emd } = await parseAddressWithRetry(item.careAddr);

            documents.push(getSavedAnimalDocument(item, si, sgg, emd));
            cnt++;
        }

        console.log(`Saved Animal ${cnt}/${numOfRows} Loaded`);
        totalCnt += cnt;

        if (totalCnt >= initMax) {
            documents.reverse();
            await AnimalGet.insertMany(documents);
            console.log('✅ initMax 도달 - 데이터 수집 완료');
            break;
        }

        if (items.length < numOfRows) {
            documents.reverse();
            await AnimalGet.insertMany(documents);
            console.log(`✅ 총 ${totalCnt}건 저장 완료 (마지막 페이지 도달)`);
            break;
        }

        console.log(`Get Animal ${pageNo} End`);
        await sleep(40);
        pageNo++;
    }
}

async function initLostObjectData() {
    let documents = [];
    let totalCnt = 0;
    let pageNo = 1;

    while (true) {
        console.log(`Lost Object ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchLostObjectPage, [pageNo, numOfRows]);

        console.log(`Lost Object ${pageNo} Page Loaded!`);
        
        const items = result?.response?.body?.items?.item || [];

        if (items.length === 0) {
            console.log('📭 더 이상 불러올 데이터가 없습니다.');

            if (documents.length > 0) {
                documents.reverse();
                await ObjectLost.insertMany(documents);
                console.log(`✅ 총 ${totalCnt}건 저장 완료 (API 종료)`);    
            }
            break;
        }

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const detailResult = await fetchUntilSuccess(fetchLostObjectDetail, [items[i].atcId]);
            await sleep(40);

            if (detailResult?.response?.body !== '') {
                const detailItem = detailResult.response.body.item;
                let si = '', sgg = '', emd = '';

                try {
                    const keyword = detailItem.orgNm.trim(); // ← 공백 제거
                    const addressRes = await fetchAddress(keyword);
                    const rawJuso = addressRes?.results?.juso;
                    const lstLctNm = detailItem.lstLctNm?.trim();

                    let juso = null;

                    if (Array.isArray(rawJuso) && rawJuso.length > 0) {
                    juso = rawJuso[0];
                    } else if (typeof rawJuso === 'object' && rawJuso !== null) {
                    juso = rawJuso;
                    }
                    
                    if (juso && juso.siNm === lstLctNm) {
                        si = juso.siNm || '';
                        sgg = juso.sggNm || '';
                        emd = juso.emdNm || '';
                    } else {
                        si = lstLctNm; // 주소 결과 없음이거나 시/도가 다르면 최소한 이것만 넣기
                        sgg = '';
                        emd = '';
                    }

                } catch (err) {
                    console.error(`❌ 주소 파싱 오류 (${detailItem.orgNm}):`, err.message);
                    si = detailItem.lstLctNm || ''; // 예외 시에도 최소한 시/도는 넣기
                    sgg = '';
                    emd = '';
                }
                documents.push(getLostObjectDocument(detailItem, si, sgg, emd));
                cnt++;
            }
        }
        console.log(`Lost Object ${cnt}/${numOfRows} Loaded`);
        totalCnt += cnt;

        if (totalCnt >= initMax){
            // setLastAtcId(documents[0].atcId);
            documents.reverse();
            await ObjectLost.insertMany(documents);
            console.log('데이터 수집 완료');
            break;
        }
        console.log(`Lost Object ${pageNo} End`);
        await sleep(40);
        pageNo++;
    }

    if (totalCnt > 0 && totalCnt < initMax) {
        documents.reverse();
        await AnimalLost.insertMany(documents);
        console.log(`✅ 총 ${totalCnt}건 저장 완료 (initMax 미도달)`);
    }
}


async function initPoliceFoundObjectData() {
    let documents = [];
    let totalCnt = 0;
    let pageNo = 1;

    while (true) {
        console.log(`Police Found Object ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchPoliceGetObjectPage, [pageNo, numOfRows]);
        console.log(`${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;
            
            let si = '', sgg = '', emd = '';

            try {
                const keyword = item.depPlace.trim();
                const addressRes = await fetchAddress(keyword);
                const rawJuso = addressRes?.results?.juso;

                let juso = null;
                if (Array.isArray(rawJuso) && rawJuso.length > 0) {
                    juso = rawJuso[0];
                } else if (typeof rawJuso === 'object' && rawJuso !== null) {
                    juso = rawJuso;
                }

                si = juso.siNm || '';
                sgg = juso.sggNm || '';
                emd = juso.emdNm || '';

            } catch (err) {
                console.error(`❌ 습득 주소 파싱 오류 (${item.orgNm}):`, err.message);
            }

            documents.push(getPoliceFoundObjectDocument(item, si, sgg, emd));
            cnt++;
        }

        console.log(`Found Object ${cnt}/${numOfRows} Loaded`);
        totalCnt += cnt;

        if (totalCnt >= initMax/2) {
            documents.reverse();
            await ObjectGet.insertMany(documents);
            console.log('습득물 데이터 초기 수집 완료');
            break;
        }

        console.log(`Police Found Object ${pageNo} End`);
        await sleep(40);
        pageNo++;
    }
}

async function initOrgFoundObjectData() {
    let documents = [];
    let totalCnt = 0;
    let pageNo = 1;

    while (true) {
        console.log(`Org Found Object ${pageNo} Start!`);

        const result = await fetchUntilSuccess(fetchOrgGetObjectPage, [pageNo, numOfRows]);

        console.log(`${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;
            
            let si = '', sgg = '', emd = '';

            try {
                const keyword = item.depPlace.trim();
                const addressRes = await fetchAddress(keyword);
                const rawJuso = addressRes?.results?.juso;

                let juso = null;
                if (Array.isArray(rawJuso) && rawJuso.length > 0) {
                    juso = rawJuso[0];
                } else if (typeof rawJuso === 'object' && rawJuso !== null) {
                    juso = rawJuso;
                }

                si = juso.siNm || '';
                sgg = juso.sggNm || '';
                emd = juso.emdNm || '';
                
            } catch (err) {
                console.error(`❌ 습득 주소 파싱 오류 (${item.orgNm}):`, err.message);
            }

            documents.push(getOrgFoundObjectDocument(item, si, sgg, emd));
            cnt++;
        }

        console.log(`Found Object ${cnt}/${numOfRows} Loaded`);
        totalCnt += cnt;

        if (totalCnt >= initMax/2) {
            documents.reverse();
            await ObjectGet.insertMany(documents);
            console.log('습득물 데이터 초기 수집 완료');
            break;
        }

        console.log(`Org Found Object ${pageNo} End`);
        await sleep(40);
        pageNo++;
    }
}

async function fetchUntilSuccess(fetchFunc, args, delay = 10000) {
    while (true) {
        try {
            const result = await fetchFunc(...args);

            // ✅ 최상단 객체부터 안전성 검증
            if (!result?.response) {
                console.log(args);
                console.warn(`⚠️ 응답에 response가 없습니다. 재시도합니다.`);
                await sleep(delay);
                continue;
            }

            // 여기서 return — body 없더라도 반환은 함
            return result;
        } catch (err) {
            console.error(`❌ ${fetchFunc.name} 오류 발생:`, err.message);
        }

        await sleep(delay); // 일정 시간 쉬고 반복
    }
}

async function parseAddressWithRetry(rawAddr) {
    const originalKeyword = cleanAddress(rawAddr);
    let keyword = originalKeyword;
    let si = '', sgg = '', emd = '';

    // 최대 10회 시도
    for (let retry = 0; retry < 10; retry++) {
        try {
            const addressRes = await fetchAddress(keyword);
            const rawJuso = addressRes?.results?.juso;

            let juso = null;
            if (Array.isArray(rawJuso) && rawJuso.length > 0) {
                juso = rawJuso[0];
            } else if (typeof rawJuso === 'object' && rawJuso !== null) {
                juso = rawJuso;
            }

            if (juso) {
                si = juso.siNm || '';
                sgg = juso.sggNm || '';
                emd = juso.emdNm || '';
                return { si, sgg, emd };
            }
        } catch (err) {
            console.warn(`⚠️ 주소 파싱 오류 (${keyword}) [시도 ${retry + 1}/10]:`, err.message);
            await sleep(300);
        }
    }

    // 10회 실패한 경우: 숫자 이후 잘라서 최대 3회 시도
    const shortened = keyword.replace(/\s?\d+[^\d\s]*$/, '').trim();
    if (shortened !== keyword) {
        for (let retry = 0; retry < 3; retry++) {
            try {
                const addressRes = await fetchAddress(shortened);
                const rawJuso = addressRes?.results?.juso;

                let juso = null;
                if (Array.isArray(rawJuso) && rawJuso.length > 0) {
                    juso = rawJuso[0];
                } else if (typeof rawJuso === 'object' && rawJuso !== null) {
                    juso = rawJuso;
                }

                if (juso) {
                    si = juso.siNm || '';
                    sgg = juso.sggNm || '';
                    emd = juso.emdNm || '';
                    return { si, sgg, emd };
                }
            } catch (err) {
                console.warn(`⚠️ 축소 주소 파싱 실패 (${shortened}) [시도 ${retry + 1}/3]:`, err.message);
                await sleep(300);
            }
        }
    }

    return { si, sgg, emd }; // 최종 실패 시 빈 값 반환
}

function cleanAddress(addr) {
  // 1. 괄호 및 괄호 안 제거
  addr = addr.replace(/\s*\(.*?\)\s*/g, '');

  // 2. 도로명+숫자+번지를 추출 (예: 외동반림로282번길 32)
  const match = addr.match(/.*\d{1,5}[\-\d]*\s*/);
  return match ? match[0].trim() : addr.trim();
}

function getDateStrings() {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const format = (date) =>
    date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD 형식

  return {
    bgnde: format(oneYearAgo), // 과거
    endde: format(today)        // 오늘
  };
}

function getYesterdayDateStrings() {
  const today = new Date();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(today.getDate() - 1);

  const format = (date) =>
    date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD 형식

  return {
    bgnde: format(oneDayAgo), // 과거
    endde: format(today)        // 오늘
  };
}

async function deleteAll() {
    await AnimalLost.deleteMany({});
    await AnimalGet.deleteMany({});
    await ObjectLost.deleteMany({});
    await ObjectGet.deleteMany({});
    console.log('모든 데이터 삭제 완료');
}

async function latestGetAnimalDocument() {
    const sorted = await AnimalGet.find({user_id: '구조동물'}).sort({_id:-1}).limit(1);
    return sorted[0];
}

async function latestLostObjectDocument() {
    const sorted = await ObjectLost.find({user_id: '경찰청'}).sort({_id:-1}).limit(1);
    return sorted[0];
}

async function latestPoliceGetObjectDocument() {
    const sorted = await ObjectGet.find({user_id: '경찰청'}).sort({_id:-1}).limit(1);
    return sorted[0];
}

async function latestOrgGetObjectDocument() {
    const sorted = await ObjectGet.find({user_id: '포털기관'}).sort({_id:-1}).limit(1);
    return sorted[0];
}

async function getLastAtcId() {
    const configCollection = mongoose.connection.db.collection('config');
    const doc = await configCollection.findOne();
    console.log(doc);
    return doc?.object_lost_last_atcId;
}

async function setLastAtcId(atcId) {
    const configCollection = mongoose.connection.db.collection('config');
    await configCollection.updateOne(
        {}, {$set:{object_lost_last_atcId : atcId }}
    );
}

async function getLastFoundAtcId() {
    const configCollection = mongoose.connection.db.collection('config');
    const doc = await configCollection.findOne();
    return doc?.object_get_last_atcId;
}

async function setLastFoundAtcId(atcId) {
    const configCollection = mongoose.connection.db.collection('config');
    await configCollection.updateOne(
        {}, { $set: { object_get_last_atcId: atcId } }
    );
}


async function update() {
    await connectDB();

     // 분실동물
    const LostAnmalcnt = await AnimalLost.countDocuments({user_id:"분실동물"});

    if(LostAnmalcnt != 0){
        await updateLostAnimalData();
    }else{
        await initLostAnimalData();
    }

    // 구조동물
    const GetAnmalcnt = await AnimalGet.countDocuments({user_id:"구조동물"});

    if(GetAnmalcnt != 0){
        const lastDoc = await latestGetAnimalDocument();
        await updateSavedAnimalData(lastDoc.desertionNo);
    }else{
        await initGetAnimalData();
    }

    // 분실물
    const cnt = await ObjectLost.countDocuments({user_id:"경찰청"});

    if(cnt != 0){
        const lastDoc = await latestLostObjectDocument();
        await updateLostObjectData(lastDoc.atcId);
    }else{
        await initLostObjectData();
    }

    // 경찰청 습득물
    const policeFoundCnt = await ObjectGet.countDocuments({ user_id: "경찰청" });

    if (policeFoundCnt !== 0) {
        const lastDoc = await latestPoliceGetObjectDocument();
        await updatePoliceFoundObjectData(lastDoc.atcId);
    } else {
        await initPoliceFoundObjectData();
    }

    // 포털기관관 습득물
    const OrgFoundCnt = await ObjectGet.countDocuments({ user_id: "포털기관" });

    if (OrgFoundCnt !== 0) {
        const lastDoc = await latestOrgGetObjectDocument();
        await updateOrgFoundObjectData(lastDoc.atcId);
    } else {
        await initOrgFoundObjectData();
    }

}

async function clear() {
    await connectDB();

    await deleteAll();

    mongoose.disconnect(); 
}

async function test() {
    let result = await fetchLostObjectPage(1, 10);

    console.log(result.response.body.items)
}

update();

module.exports = { update };