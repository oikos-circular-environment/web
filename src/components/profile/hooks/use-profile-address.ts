import { useQuery } from "@tanstack/react-query";

import { getProfileAddressAction } from "@/app/(dashboard)/dashboard/profile/actions";

const profileAddressQueryKey = ["profile", "address"];

export function useProfileAddress() {
  const query = useQuery({
    queryKey: profileAddressQueryKey,
    queryFn: getProfileAddressAction,
  });

  return {
    address: query.data?.address ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
