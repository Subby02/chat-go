import './Header.css';

const Header = ({ icon, mainTitle, subTitle, mypage, login, register }) => {
  return(
    <header className='Header'>
      <div className='Left'>
        <div className='Main_Icon'>{icon}</div>
        <div className='Titles'>
          <div className='Main_Header'>{mainTitle}</div>
          <div className='Sub_Header'>{subTitle}</div>
        </div>
      </div>

      <div className='Right'>
        <div className='Button_MyPage'>{mypage}</div>
        <div className='Button_Login'>{login}</div>
        <div className='Button_Register'>{register}</div>
      </div>
      
    </header>
  )
};

export default Header;