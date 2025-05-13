const cron = require('node-cron');
const request = require('request');
const { YourModel } = require('./models/YourModel');

const SERVICE_KEY = process.env.PUBLIC_DATA_API_KEY;
const BASE_URL = 'http://apis.data.go.kr/1320000/LosfundInfoInqireService/getLosfundInfoAccToClAreaPd';

function buildUrl(page) {
  const params = [
    `serviceKey=${SERVICE_KEY}`,
    `PRDT_CL_CD_01=PRH000`,
    `PRDT_CL_CD_02=PRH200`,
    `FD_COL_CD=CL1002`,
    `START_YMD=20180302`,
    `END_YMD=20180802`,
    `N_FD_LCT_CD=LCA000`,
    `pageNo=${page}`,
    `numOfRows=40`
  ];
  return `${BASE_URL}?${params.join('&')}`;
}

function fetchPage(page) {
  return new Promise((resolve, reject) => {
    request({ url: buildUrl(page), method: 'GET' }, (error, response, body) => {
      if (error) return reject(error);
      try {
        const json = JSON.parse(body);
        resolve(json.response.body.items.item || []);
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function startFetch() {
  let page = 1;
  let totalSaved = 0;
  let stop = false;

  while (!stop) {
    const items = await fetchPage(page);
    if (!items.length) break;

    for (let item of items) {
      const exists = await YourModel.exists({ id: item.id }); // 고유 필드 사용
      if (exists) {
        stop = true;
        break;
      }

      await YourModel.create(item);
      totalSaved++;

      const total = await YourModel.countDocuments();
      if (total > 90000) {
        const excess = total - 90000;
        await YourModel.find().sort({ createdAt: 1 }).limit(excess).deleteMany();
        console.log(`🧹 ${excess}개 삭제 완료`);
      }
    }

    if (stop) break;

    page++;
    await new Promise(r => setTimeout(r, 1000)); // 초당 1회 제한
  }

  console.log(`✅ 총 ${totalSaved}개 저장 완료`);
}

// 매일 자정에 실행
cron.schedule('0 0 * * *', startFetch);
