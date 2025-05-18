import 금붕이 from './../assets/금붕이.png';
import 금붕이_사례금 from './../assets/금붕이_사례금.png';
import 돋보기 from './../assets/돋보기.svg';
export function getIconImage (iconId) {
  switch(iconId){
    case 1: 
      return 금붕이;
    case 2: 
      return 금붕이_사례금;
    case 3:
      return 돋보기;
    default: 
      return null;
  }
}