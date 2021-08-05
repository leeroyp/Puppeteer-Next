import '../styles/globals.css';
import {AppWrapper} from "../context/state";


// export default function MyApp({ Component, pageProps }) {
//   return (
//    <AppWrapper>
//       <Component {...pageProps} />
//    </AppWrapper>
//   )
// }


function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
