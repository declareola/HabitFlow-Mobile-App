// Axios API connection manager with mock fallbacks for container isolation
export const apiInstance = {
  get: async (url: string) => {
    console.log(`[API MOCK GET]: Fetching from ${url}`);
    return { data: { status: "success", timestamp: new Date().toISOString() } };
  },
  post: async (url: string, body: any) => {
    console.log(`[API MOCK POST]: Posting to ${url}`, body);
    return { data: { status: "created", body } };
  },
  delete: async (url: string) => {
    console.log(`[API MOCK DELETE]: Deleting on ${url}`);
    return { data: { status: "deleted" } };
  }
};
