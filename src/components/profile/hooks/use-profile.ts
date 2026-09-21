import type { PutV1ProfilesData } from "@oikos-circular-environment/oikos-sdk/types.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfileAction,
  updateProfileAction,
} from "@/app/(dashboard)/dashboard/profile/actions";

const profileQueryKey = ["profile"];

export function useProfile(
  initialData?: Awaited<ReturnType<typeof getProfileAction>>,
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: profileQueryKey,
    queryFn: getProfileAction,
    initialData,
  });

  const mutation = useMutation({
    mutationFn: updateProfileAction,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, { profile });
    },
  });

  return {
    profile: query.data?.profile ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

export type ProfileFormInput = PutV1ProfilesData["body"];
