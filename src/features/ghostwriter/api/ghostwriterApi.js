import { apiSlice } from "@/lib/redux/apiSlice";

export const apiSliceWithGhostwriter = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ghostwrite: builder.mutation({
      query: (lines) => ({
        url: "ghostwrite",
        method: "POST",
        body: lines ? { lines } : {},
      }),
    }),
  }),
});

export const { useGhostwriteMutation } = apiSliceWithGhostwriter;
