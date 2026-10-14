import { apiSlice } from "@/lib/redux/apiSlice";

// Replaces the cached profile with the server's copy.
const syncProfile = async (dispatch, queryFulfilled) => {
  const { data } = await queryFulfilled;
  dispatch(apiSliceWithProfile.util.updateQueryData("getProfile", undefined, () => data));
};

export const apiSliceWithProfile = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "profile",
      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation({
      query: (fields) => ({ url: "profile", method: "PATCH", body: fields }),
      // Optimistic: apply locally, roll back if the server rejects it.
      async onQueryStarted(fields, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          apiSliceWithProfile.util.updateQueryData("getProfile", undefined, (draft) => {
            Object.assign(draft, fields);
          })
        );
        try {
          await syncProfile(dispatch, queryFulfilled);
        } catch {
          patch.undo();
        }
      },
    }),

    uploadAvatar: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return { url: "profile/avatar", method: "POST", body: formData };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await syncProfile(dispatch, queryFulfilled);
        } catch {}
      },
    }),

    refreshArtistRead: builder.mutation({
      query: () => ({ url: "profile/read", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await syncProfile(dispatch, queryFulfilled);
        } catch {}
      },
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRefreshArtistReadMutation,
} = apiSliceWithProfile;
