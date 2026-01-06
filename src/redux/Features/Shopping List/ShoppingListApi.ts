import { baseApi } from '../../API/baseApi';

// ========================
// Shopping List API
// ========================
// This API handles all shopping list operations including:
// - Fetching user lists
// - Adding items (both regular and custom)
// - Updating item status
// - Deleting items
// - Clearing purchased items

const ShoppingListApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================
    // Query Endpoints (GET)
    // ========================

    // Fetch all lists for the current user
    getUserList: builder.query<any, void>({
      query: () => ({
        url: `/list`,
        method: 'GET',
      }),
      providesTags: ['UserList'],
    }),

    // Fetch a single list by ID
    getSingleList: builder.query({
      query: ({ id, token }) => {
        const params = new URLSearchParams();
        if (token) {
          params.append('token', token);
        }
        return {
          url: `/list/${id}?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['ListDetails'],
    }),

    // ========================
    // Mutation Endpoints (POST/PATCH/DELETE)
    // ========================

    // Add a new item to the list
    AddItem: builder.mutation({
      query: (Data) => ({
        url: `/list/items`,
        method: 'POST',
        body: Data,
      }),
      invalidatesTags: ['ListDetails'],
    }),

    addItemtoSpecificList: builder.mutation({
      query: ({ listId, ...data }) => ({
        url: `/list/${listId}/items`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ListDetails'],
    }),

    // Add a custom item to the list
    AddCustomItem: builder.mutation({
      query: ({ listId, ...data }) => ({
        url: `list/${listId}/custom-items`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ListDetails'],
    }),

    // Update the status of an existing item
    UpdateItemStatus: builder.mutation({
      query: ({ listId, itemId, status, token }) => ({
        url: `list/${listId}/items/${itemId}/status`,
        method: 'PATCH',
        body: { status, token },
      }),
      async onQueryStarted({ listId, itemId, status, token }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          ShoppingListApi.util.updateQueryData('getSingleList', { id: listId, token }, (draft) => {
            if (!draft?.data) return;

            // Function to find and update item in an array
            const updateInArray = (arr: any[]) => {
              if (!arr) return false;
              const item = arr.find((i) => i._id === itemId);
              if (item) {
                item.status = status;
                return true;
              }
              return false;
            };

            // Try updating in items (Recipe Items)
            if (!updateInArray(draft.data.items)) {
              // If not found, try updating in customItems
              updateInArray(draft.data.customItems);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['ListDetails'],
    }),

    // Delete a specific item from the list
    deleteUserItem: builder.mutation({
      query: ({ listId, itemId, token }) => ({
        url: `/list/${listId}/items/${itemId}`,
        method: 'DELETE',
        body: { token },
      }),
      invalidatesTags: ['ListDetails'],
    }),

    // Clear all purchased items from the list
    clearPurchasedItems: builder.mutation({
      query: ({ listId, token }) => ({
        url: `/list/${listId}/clear-purchased`,
        method: 'DELETE',
        body: { token },
      }),
      invalidatesTags: ['ListDetails'],
    }),

    // ========================
    // Sharing Endpoints
    // ========================

    // Share a list with another user
    shareList: builder.mutation({
      query: ({ listId, targetUserEmail, role }) => ({
        url: `/list/${listId}/share`,
        method: 'POST',
        body: { targetUserEmail, role },
      }),
    }),

    // Generate a shareable link for a list
    generateShareLink: builder.mutation({
      query: ({ listId, role, expiresAt }) => ({
        url: `/list/${listId}/share-link`,
        method: 'POST',
        body: { role, expiresAt },
      }),
    }),
  }),
});

export const {
  useGetUserListQuery,
  useAddItemMutation,
  useAddCustomItemMutation,
  useUpdateItemStatusMutation,
  useDeleteUserItemMutation,
  useClearPurchasedItemsMutation,
  useGetSingleListQuery,
  useAddItemtoSpecificListMutation,
  useShareListMutation,
  useGenerateShareLinkMutation,
} = ShoppingListApi;
