import "./App.css";
import { FaGithub, FaGoogle, FaFacebook, FaGit } from "react-icons/fa6";

function App() {
  if (window.location.hash === "#_=_") {
    history.replaceState
      ? history.replaceState(null, null, window.location.href.split("#")[0])
      : (window.location.hash = "");
  }

  const onGoogleLoginClicked = () => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options = {
      redirect_uri: import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URL,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const optionsQs = new URLSearchParams(options);
    const googleSignInPage = `${rootUrl}?${optionsQs.toString()}`;

    window.open(googleSignInPage, "_self");
  };

  const onFacebookLoginClicked = () => {
    const rootUrl = "https://www.facebook.com/v19.0/dialog/oauth";
    const options = {
      client_id: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_FACEBOOK_OAUTH_REDIRECT_URL,
      scope: ["email", "public_profile"].join(","),
      response_type: "code",
      auth_type: "rerequest",
    };

    const optionsQs = new URLSearchParams(options);

    const facebookSignInPage = `${rootUrl}?${optionsQs.toString()}`;
    window.open(facebookSignInPage, "_self");
  };

  const onGitHubLoginClicked = () => {
    const rootUrl = "https://github.com/login/oauth/authorize";

    const options = {
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GITHUB_OAUTH_REDIRECT_URL,
      scope: ["read:user"].join(" "),
    };

    const optionsQs = new URLSearchParams(options);
    const githubSignInPage = `${rootUrl}?${optionsQs.toString()}`;
    window.open(githubSignInPage, "_self");
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.5em",
        fontSize: "2.5em",
      }}
    >
      <p>Hi! Sign in with: </p>

      <button
        className="google-sign-in"
        onClick={onGoogleLoginClicked}
        style={{ width: "100%" }}
      >
        Google <FaGoogle />
      </button>

      <button
        className="facebook-sign-in"
        onClick={onFacebookLoginClicked}
        style={{ width: "100%" }}
      >
        Facebook <FaFacebook />
      </button>
      <button
        className="github-sign-in"
        onClick={onGitHubLoginClicked}
        style={{ width: "100%" }}
      >
        GitHub <FaGithub />
      </button>
    </div>
  );
}

export default App;
