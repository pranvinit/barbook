import { apiSlice } from "@/lib/redux/apiSlice";

export const apiSliceWithBars = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBars: builder.query({
      query: (page = 1) => ({ url: "bars", params: { page } }),
      // One cache entry for every page; pages are merged as they load.
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, response, { arg: page }) => {
        if (!currentCache || page === 1) return response;
        const seen = new Set(currentCache.bars.map((bar) => bar.id));
        return {
          ...response,
          bars: [...currentCache.bars, ...response.bars.filter((bar) => !seen.has(bar.id))],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
      providesTags: ["Bar"],
    }),

    createBar: builder.mutation({
      query: ({ text }) => ({ url: "bars", method: "POST", body: { text } }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: bar } = await queryFulfilled;
          dispatch(
            apiSliceWithBars.util.updateQueryData("getBars", 1, (draft) => {
              draft.bars.unshift(bar);
            })
          );
        } catch {
          // Error toast comes from the rejected-mutation listener.
        }
      },
      invalidatesTags: ["BarStats"],
    }),

    updateBar: builder.mutation({
      query: ({ id, text }) => ({ url: `bars/${id}`, method: "PATCH", body: { text } }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: bar } = await queryFulfilled;
          dispatch(
            apiSliceWithBars.util.updateQueryData("getBars", 1, (draft) => {
              const index = draft.bars.findIndex((b) => b.id === bar.id);
              if (index !== -1) draft.bars[index] = bar;
            })
          );
        } catch {}
      },
      invalidatesTags: ["BarStats"],
    }),

    deleteBar: builder.mutation({
      query: (id) => ({ url: `bars/${id}`, method: "DELETE" }),
      // Optimistic: remove right away, put it back if the request fails.
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          apiSliceWithBars.util.updateQueryData("getBars", 1, (draft) => {
            draft.bars = draft.bars.filter((bar) => bar.id !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["BarStats"],
    }),

    getTopBars: builder.query({
      query: () => "bars/top",
      providesTags: ["BarStats"],
    }),

    getBarStats: builder.query({
      query: () => "bars/stats",
      providesTags: ["BarStats"],
    }),
  }),
});

export const {
  useGetBarsQuery,
  useCreateBarMutation,
  useUpdateBarMutation,
  useDeleteBarMutation,
  useGetTopBarsQuery,
  useGetBarStatsQuery,
} = apiSliceWithBars;
