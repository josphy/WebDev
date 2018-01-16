import {resource, url} from './resource'

const login = (username, password) => {

    return resource('POST', 'login', {
        username,
        password
    })
        .then(r => {
            return r.result;
        })
        .catch(r => {
          return `"${r.message || 'Error'}" when logging in`;
        });
}

const logout = () => {
    return resource('PUT', 'logout','')
        .then(r => {return "You have logged out";})
        .catch(r => {return `"${r.message}" when logging out`;});
};

const toggle = (show) => {
    const toggleElement = _show => id => {
        const el = document.querySelector(id);
        if (el) {
            el.style.display = _show ? 'inline' : 'none';
        }
    };
    ['#username', '#password', '#login'].forEach(toggleElement(show));
    ['#logout', '#headline', '#newHeadline'].forEach(toggleElement(!show));
};

const getProfile = () => {
  return resource('GET', 'profile','')
    .then(r => {return r;})
    .catch(r => {return `"${r.message}" when getting profile`;});
}

const updateStatus = (newStatus) => {
  return resource('POST', 'headline', newStatus);
}

const navigateToMain = () => {
  return "main";
}

const navigateToProfile = () => {
  return "profile";
}

const navigateToAuth = () => {
  return "auth";
}

export { login, logout, getProfile, updateStatus, navigateToMain, navigateToProfile, navigateToAuth };
