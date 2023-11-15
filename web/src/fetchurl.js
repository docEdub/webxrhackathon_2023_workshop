import { Auth } from 'aws-amplify';
import amplifyConfig from './amplifyconfigure';

const API_GATEWAY_URL = amplifyConfig.Api.url + 'assets';

export async function fetchPreSignedUrl(assetKey, action = 'GET') {
    try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();

        console.log("assetkey is" + assetKey);

        const response = await fetch(`${API_GATEWAY_URL}?assetKey=${assetKey}`, {
          headers: {
            Authorization: idToken,
            'Content-Type': 'application/json',
            },
           method: action,
        });
        const responseData = await response.json();
        console.log("response is" + JSON.stringify(responseData, null, 2));
        return responseData.ps_url;
    } catch (err) {
        console.error('Failed to fetch the pre-signed URL:', err.message);
        throw err;
    }
}

export default fetchPreSignedUrl;
