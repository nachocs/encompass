export function getMtSsoUrl() {
  let envName = process.env.NODE_ENV;

  if (envName === 'production') {
    return process.env.MT_SSO_URL_PROD;
  }

  if (envName === 'staging') {
    return process.env.MT_SSO_URL_STAGING;
  }

  if (envName === 'seed') {
    return process.env.MT_SSO_URL_TEST;
  }
  return process.env.MT_SSO_URL_DEV;
}

export function getVmtUrl() {
  let envName = process.env.NODE_ENV;

  if (envName === 'production') {
    return process.env.VMT_URL_PROD;
  }

  if (envName === 'staging') {
    return process.env.VMT_URL_STAGING;
  }
  return process.env.VMT_URL_DEV;
}

export function getEncIssuerId() {
  let envName = process.env.NODE_ENV;

  if (envName === 'production') {
    return process.env.ENC_JWT_ISSUER_ID_PROD;
  }

  if (envName === 'staging') {
    return process.env.ENC_JWT_ISSUER_ID_STAGING;
  }

  if (envName === 'seed') {
    return process.env.ENC_JWT_ISSUER_ID_TEST;
  }

  return process.env.ENC_JWT_ISSUER_ID_DEV;
}

export function getMtIssuerId() {
  let envName = process.env.NODE_ENV;

  if (envName === 'production') {
    return process.env.MT_SSO_JWT_ISSUER_ID_PROD;
  }

  if (envName === 'staging') {
    return process.env.MT_SSO_JWT_ISSUER_ID_STAGING;
  }

  if (envName === 'seed') {
    return process.env.MT_SSO_JWT_ISSUER_ID_TEST;
  }

  return process.env.MT_SSO_JWT_ISSUER_ID_DEV;
}

export function getVmtIssuerId() {
  let envName = process.env.NODE_ENV;

  if (envName === 'production') {
    return process.env.VMT_JWT_ISSUER_ID_PROD;
  }

  if (envName === 'staging') {
    return process.env.VMT_JWT_ISSUER_ID_STAGING;
  }

  if (envName === 'seed') {
    return process.env.VMT_JWT_ISSUER_ID_TEST;
  }

  return process.env.VMT_JWT_ISSUER_ID_DEV;
}
