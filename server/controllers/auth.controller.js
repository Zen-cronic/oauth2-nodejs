"use strict";

const axios = require("axios").default;
const qs = require("querystring");

/**
 * @typedef {typeof User.schema.obj} UserDocument
 */

/**
 * @typedef {"google" | "facebook" | "github"} AuthProvider
 */

//to avoid accidental modification in our code
const AUTH_PROVIDER = Object.freeze({
  GOOGLE: "google",
  FACEBOOK: "facebook",
  GITHUB: "github",
});

/**
 * @typedef {Object} GoogleTokensResult
 * @property {string} access_token - The access token.
 * @property {number} expires_in - The number of seconds until the token expires.
 * @property {string} refresh_token - The refresh token.
 * @property {string} scope - The scope of the access token.
 * @property {string} id_token - The ID token.
 */

/**
 * @typedef {Object} GoogleUserResult
 * @property {string} id - The user's id.
 * @property {string} email - The user's email.
 * @property {boolean} verified_email - Whether the user's email is verified.
 * @property {string} name - The user's name.
 * @property {string} given_name - The user's given name.
 * @property {string} family_name - The user's family name.
 * @property {string} picture - The URL of the user's profile picture.
 * @property {string} locale - The user's locale.
 */

/**
 *  Fetch google user using id_token and access_token
 * @param {TokenData} tokenData
 * @returns {Promise<GoogleUserResult>}
 */
const fetchGoogleUser = async (tokenData) => {
  const { id_token, access_token } = tokenData;
  try {
    const res = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @typedef {Object} FacebookTokensResult
 * @property {string} access_token - The access token.
 * @property {string} token_type - The type of the token. E.g., bearer
 * @property {number} expires_in - The number of seconds until the token expires.
 * @property {string} [auth_type] - The authorization type. This property is optional.
 */

/**
 * @typedef {Object} FacebookUserResult
 * @property {string} name - The user's name.
 * @property {string} email - The user's email.
 * @property {Object} picture - The user's profile picture.
 * @property {Object} picture.data - The data of the user's profile picture.
 * @property {number} picture.data.height - The height of the user's profile picture.
 * @property {number} picture.data.width - The width of the user's profile picture.
 * @property {boolean} picture.data.is_silhouette - Whether the user's profile picture is a silhouette.
 * @property {string} picture.data.url - The URL of the user's profile picture.
 * @property {string} id - The user's id.
 */

/**
 *
 * @param {TokenData} tokenData
 * @returns {Promise<FacebookUserResult>}
 */
const fetchFacebookUser = async (tokenData) => {
  const { access_token } = tokenData;
  try {
    const res = await axios.get(
      `https://graph.facebook.com/v19.0/me?fields=name,email,picture&access_token=${access_token}`
    );

    return res.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @typedef {Object} GitHubTokenResult
 * @property {string} access_token - The access token.
 * @property {string} token_type - The type of token (e.g., Bearer).
 * @property {string} scope - The approved/requested scopes.
 */

/**
 * @typedef {Object} GithubUserResult
 * @property {string} login - The user's login name.
 * @property {number} id - The user's unique ID.
 * @property {string} node_id - The user's GraphQL API id.
 * @property {string} avatar_url - The URL of the user's avatar.
 * @property {string} gravatar_id - The user's Gravatar ID.
 * @property {string} url - The URL of the user's GitHub API endpoint.
 * @property {string} html_url - The URL of the user's GitHub profile.
 * @property {string} repos_url - The URL of the user's repositories.
 * @property {string} type - The type of user (usually "User").
 * @property {boolean} site_admin - Whether the user is a site admin.
 * @property {string} name - The user's name.
 * @property {string} blog - The URL of the user's blog.
 * @property {string} location - The user's location.
 * @property {string|null} email - The user's email.
 * @property {string} bio - The user's bio.
 */
/**
 *
 * @param {TokenData} tokenData
 * @returns {Promise<GithubUserResult>}
 */

const fetchGitHubUser = async (tokenData) => {
  const { access_token } = tokenData;

  try {
    const res = await axios.get(`https://api.github.com/user`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    return res.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {AuthProvider} authProvider
 * @param {string} authCode
 * @returns {Promise<GoogleTokensResult | FacebookTokensResult | GitHubTokenResult>}
 */
const fetchOAuthTokens = async (authProvider, authCode) => {
  let tokenUrl = "";
  let authValues = {};

  switch (authProvider) {
    case AUTH_PROVIDER.FACEBOOK:
      tokenUrl = "https://graph.facebook.com/v19.0/oauth/access_token";
      authValues = {
        code: authCode,
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: process.env.FACEBOOK_OAUTH_REDIRECT_URL,
      };

      break;

    case AUTH_PROVIDER.GOOGLE:
      tokenUrl = "https://oauth2.googleapis.com/token";
      authValues = {
        code: authCode,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
        grant_type: "authorization_code",
      };
      break;

    case AUTH_PROVIDER.GITHUB:
      tokenUrl = "https://github.com/login/oauth/access_token";

      authValues = {
        code: authCode,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_OAUTH_REDIRECT_URL,
      };

      break;
    default:
      //handled by handler
      throw new Error(`Unrecognized OAuth Provider: ${authProvider}`);
  }

  const res = await axios.post(tokenUrl, qs.stringify(authValues), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json", //for GitHub
    },
  });

  return res.data;
};

/**
 * @typedef {Object} TokenData
 * @property {string} access_token
 * @property {string} [id_token]
 */

/**
 *
 * @param {AuthProvider} authProvider
 * @param {TokenData} tokenData
 */
const fetchUser = async (authProvider, tokenData) => {
  if (!tokenData) {
    throw new Error("tokenData is undefined");
  }

  const { access_token, id_token } = tokenData;

  if (typeof access_token !== "string") {
    throw new Error("ACCESS_TOKEN is a must for any provider");
  }

  let fn;

  switch (authProvider) {
    case AUTH_PROVIDER.GOOGLE:
      fn = fetchGoogleUser;
      break;
    case AUTH_PROVIDER.FACEBOOK:
      fn = fetchFacebookUser;
      break;
    case AUTH_PROVIDER.GITHUB:
      fn = fetchGitHubUser;
      break;

    default:
      throw new Error("Unrecognized OAuth Provider");
  }

  const user = await fn(tokenData);
  return user;
};

const oauthHandler = async (req, res) => {
  const code = req.query.code;
  const provider = req.query.provider;

  console.log({ code, provider });

  try {
    if (!code || !provider) {
      throw new Error("Code AND provider required as params in redirect_uri");
    }

    const tokenData = await fetchOAuthTokens(provider, code);

    const user = await fetchUser(provider, tokenData);

    //process user

    console.log("Logged in user: ", user);

    return res.redirect(`${process.env.ORIGIN}/profile/${provider}`);
    
  } catch (error) {
    throw new Error(error?.message);
  }
};
module.exports = {
  oauthHandler,
};
