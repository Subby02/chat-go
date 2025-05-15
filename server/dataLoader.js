const mongoose = require('mongoose');
const axios = require('axios');
const { Object_lost } = require('./models/object_lost'); 
require('dotenv').config()

let numOfRows = 100;
let initMax = 100;

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

async function fetchPage(pageNo, numOfRows) {
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

async function fetchDetail(atcId, fdSn) {
    const url = 'http://apis.data.go.kr/1320000/LostGoodsInfoInqireService/getLostGoodsDetailInfo';
    let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + process.env.PUBLIC_DATA_API_KEY;
    queryParams += '&' + encodeURIComponent('ATC_ID') + '=' + encodeURIComponent(atcId);
    queryParams += '&' + encodeURIComponent('FD_SN') + '=' + encodeURIComponent(fdSn);

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
        return response.data;
    } catch (error) {
        console.log(url + queryParams);
        console.error(error.message);
    }
}

function getDocument(item, si, sgg, emd){
    return {
        user_id: '경찰청',
        atcId: item.atcId,
        lstPrdtNm: item.lstPrdtNm,
        lstYmd: item.lstYmd,
        lstHor: item.lstHor,
        lstPlace: item.lstPlace,
        si: si,
        sgg: sgg,
        emd: emd,
        prdtClnm: item.prdtClnm,
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

async function updateData(lastAtcId) {
    let pageNo = 1;
    let isDone = false;

    while (true) {
        console.log(`${pageNo} Start!`);
        let documents = [];

        const result = await fetchPage(pageNo, numOfRows);
        console.log(`${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const detailResult = await fetchDetail(items[i].atcId, items[i].fdSn);
            await sleep(40);

            if (detailResult?.response?.body !== '') {
                const detailItem = detailResult.response.body.item;

                if (detailItem.atcId === lastAtcId) {
                    isDone = true;
                    break;
                }

                cnt++;
                documents.push(getDocument(detailItem,"c","b","a"));
            }
        }

        console.log(`${cnt}/${numOfRows} Loaded`);
        await Object_lost.insertMany(documents);
        console.log(`${pageNo} End`);

        if (isDone) {
            console.log('데이터 수집 완료');
            break;
        }

        await sleep(40);
        pageNo++;
    }
}

async function initData() {
    let totalCnt = 0;
    let pageNo = 1;

    while (true) {
        console.log(`${pageNo} Start!`);
        let documents = [];

        const result = await fetchPage(pageNo, numOfRows);
        console.log(`${pageNo} Page Loaded!`);

        const items = result?.response?.body?.items?.item || [];

        let cnt = 0;
        for (let i = 0; i < items.length; i++) {
            const detailResult = await fetchDetail(items[i].atcId, items[i].fdSn);
            await sleep(40);
            if (detailResult?.response?.body !== '') {
                const detailItem = detailResult.response.body.item;
                cnt++;
                documents.push(getDocument(detailItem,"c","b","a"));
            }
        }
        console.log(`${cnt}/${numOfRows} Loaded`);
        await Object_lost.insertMany(documents);
        totalCnt += cnt;
        if (totalCnt >= initMax){
            console.log('데이터 수집 완료');
            break;
        }
        console.log(`${pageNo} End`);
        await sleep(40);
        pageNo++;
    }
}

async function deleteAll() {
    await Object_lost.deleteMany({});
    console.log('모든 데이터 삭제 완료');
}

async function latestDocument() {
    const sorted = await Object_lost.find().sort({ _id: -1 }).limit(1);
    return sorted[0];
}

async function update() {
    await connectDB();

    const lastDoc = await latestDocument();

    await updateData(lastDoc.atcId);

    mongoose.disconnect(); 
}

async function init() {
    await connectDB();

    await initData();

    mongoose.disconnect(); 
}

async function clear() {
    await connectDB();

    await deleteAll();

    mongoose.disconnect(); 
}

async function test() {
    let result = await fetchAddress("맥도날드");

    console.log(result)
}

init();


