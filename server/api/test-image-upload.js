const { transactionLineItems } = require('../api-util/lineItems');
const { getSdk, getTrustedSdk, handleError, serialize, getIntegrationSdk } = require('../api-util/sdk');

module.exports = (req, res) => {
  const { file } = req;

  console.log({ file })

    const integrationSdk = getIntegrationSdk();
    const sdk = getSdk(req, res);
    
    integrationSdk.images.upload({ image: file.path }, { expand: true })
      .then(resp => {
        const uploadedImage = resp.data.data;
        console.log({ uploadedImage })

        return sdk.currentUser.updateProfile(
          { profileImageId: uploadedImage.id },
          { expand: true, include: ['profileImage'] })
      })
      .then(userResp => {
        const currentUser = userResp.data

        res
        .status(200)
        .set('Content-Type', 'application/transit+json')
        .send(
          serialize({
            status: 200,
            statusText: 'Ok',
            data: currentUser,
            })
            )
            .end();
        })
        .catch(e => {
            handleError(res, e);
      });
};
