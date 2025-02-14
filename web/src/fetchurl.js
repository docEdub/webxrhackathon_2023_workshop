import { Auth } from 'aws-amplify';
import { LOADERS } from './loaders';
import amplifyConfig from './amplifyconfigure';

const API_GATEWAY_URL = amplifyConfig.Api.url;

export async function fetchPreSignedUrl(assetKey, action = 'GET') {
    try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();

        console.log("assetkey is" + assetKey);

        const response = await fetch(`${API_GATEWAY_URL}assets?assetKey=${assetKey}`, {
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

export async function fetchAllPreSignedUrls(assetKey) {
    try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();

        console.log("assetkey is " + assetKey);

        const response = await fetch(`${API_GATEWAY_URL}assets/all?assetKey=${assetKey}`, {
          headers: {
            Authorization: idToken,
            'Content-Type': 'application/json',
            },
           method: 'GET',
        });
        const responseData = await response.json();
        console.log("response is" + JSON.stringify(responseData, null, 2));
        return responseData.pre_signed_urls;
    } catch (err) {
        console.error('Failed to fetch the pre-signed URL:', err.message);
        throw err;
    }
}

export default fetchPreSignedUrl;


const MAX_RETRIES = 3;

export async function loadAsset(assetType, assetKey, processAsset, retryCount = 0) {
    try {
        // TODO: Switch to using the pre-signed URL from the API Gateway.
        const preSignedUrl = assetKey;
        // const preSignedUrl = await fetchPreSignedUrl(assetKey);

        const loader = LOADERS[assetType];
        if (!loader) {
            throw new Error(`No loader defined for asset type: ${assetType}`);
        }

        console.log("presignedURL" + preSignedUrl);

        return loader.load(preSignedUrl, processAsset, undefined, (err) => {
            console.error(`Failed to load the asset: ${assetKey}`, err);
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying to load asset: ${assetKey}. Attempt ${retryCount + 1}`);
                loadAsset(assetType, assetKey, processAsset, retryCount + 1);
            } else {
                console.error(`Failed to load asset: ${assetKey} after ${MAX_RETRIES} attempts.`);
            }
        });
    } catch (err) {
        console.error(`Failed to load the asset: ${assetKey}`, err.message);
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying to load asset: ${assetKey}. Attempt ${retryCount + 1}`);
            loadAsset(assetType, assetKey, processAsset, retryCount + 1);
        } else {
            console.error(`Failed to load asset: ${assetKey} after ${MAX_RETRIES} attempts.`);
        }
    }
}
