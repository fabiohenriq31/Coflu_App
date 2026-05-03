let accessToken: string | null = null;

export const authToken = {
  get() {
    return accessToken;
  },

  set(token: string | null) {
    accessToken = token;
  },
};
