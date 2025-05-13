const router = require('express').Router()
const path = require('path');

//고정 경로는 :num보다 위에 선언
//:num은 문자열도 포함되기 때문에 고정 경로가 덮어 씌어질 수 있다.

//분실물 습득(작성, 수정, 세부내용 조회, 목록 조회)
router.get('/object/get/write', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'object', 'get', 'write.html'));
});
router.get('/object/get/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'object', 'get', 'edit.html'));
})
router.get('/object/get/detail/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'object', 'get', 'detail.html'));
})
router.get('/object/get/:num', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'object', 'get', 'list.html'));
});

//분실물 제보(작성, 수정, 세부내용 조회, 목록 조회)
router.get('/object/lost/write', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'object', 'lost', 'write.html'));
});
router.get('/object/lost/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'object', 'lost', 'edit.html'));
})
router.get('/object/lost/detail/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'object', 'lost', 'detail.html'));
})
router.get('/object/lost/:num', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'object', 'lost', 'list.html'));
});

//포상금 유기동물(작성, 수정, 세부내용 조회, 목록 조회)
router.get('/reward/animal/write', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'reward', 'animal', 'write.html'));
});
router.get('/reward/animal/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'reward', 'animal', 'edit.html'));
})
router.get('/reward/animal/detail/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'reward', 'animal', 'detail.html'));
});
router.get('/reward/animal/:num', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'reward', 'animal', 'list.html'));
});

//포상금 분실물(작성, 수정, 세부내용 조회, 목록 조회)
router.get('/reward/object/write', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'reward', 'object', 'write.html'));
});
router.get('/reward/object/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'reward', 'object', 'edit.html'));
})
router.get('/reward/object/detail/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'reward', 'object', 'detail.html'));
});
router.get('/reward/object/:num', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'reward', 'object', 'list.html'));
});

router.get('/test/animal', (req, res) => {
    console.log(__dirname)
    res.sendFile(path.join(__dirname, '..', 'views', 'animal.html'));
});

router.get('/register', (req, res) => {
    if(!req.isAuthenticated()){
        res.sendFile(path.join(__dirname, '..', 'views', 'register.html'));
    }else{
        res.redirect('/')
    }
});

router.get('/login', (req, res) => {
    if(!req.isAuthenticated()){
        res.sendFile(path.join(__dirname,'..', 'views', 'login.html'));
    }else{
        res.redirect('/')
    }
});

router.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'views', 'reset-password.html'));
});

module.exports = router