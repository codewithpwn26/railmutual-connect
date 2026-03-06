import type { Profile, PublicUser, SearchFilters } from "@/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ─── Profile ────────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Profile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.getCallerUserProfile();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Unauthorized") || msg.includes("not found")) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useRegisterOrLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerOrLogin();
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(["currentUserProfile"], profile);
      queryClient.setQueryData(["registerOrLoginProfile"], profile);
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      department: string;
      designation: string;
      railwayZone: string;
      division: string;
      currentPostingLocation: string;
      desiredPostingLocation: string;
      contactVisible: boolean;
      email: string | null;
      phone: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");

      // Try updateProfile first; if profile not found, use saveCallerUserProfile
      try {
        await actor.updateProfile(
          data.fullName,
          data.department,
          data.designation,
          data.railwayZone,
          data.division,
          data.currentPostingLocation,
          data.desiredPostingLocation,
          data.contactVisible,
          data.email,
          data.phone,
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Profile not found") || msg.includes("not found")) {
          // Fallback: use saveCallerUserProfile with a constructed profile
          const existing = await actor.getCallerUserProfile();
          if (!existing) {
            // Last resort: registerOrLogin to create the record, then update
            await actor.registerOrLogin();
            await actor.updateProfile(
              data.fullName,
              data.department,
              data.designation,
              data.railwayZone,
              data.division,
              data.currentPostingLocation,
              data.desiredPostingLocation,
              data.contactVisible,
              data.email,
              data.phone,
            );
          } else {
            // Build updated profile — convert null to undefined to match Profile type
            const updated: Profile = {
              ...existing,
              fullName: data.fullName,
              department: data.department,
              designation: data.designation,
              railwayZone: data.railwayZone,
              division: data.division,
              currentPostingLocation: data.currentPostingLocation,
              desiredPostingLocation: data.desiredPostingLocation,
              contactVisible: data.contactVisible,
              email: data.email ?? undefined,
              phone: data.phone ?? undefined,
            };
            await actor.saveCallerUserProfile(updated);
          }
        } else {
          throw err;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const stats = await actor.getDashboardStats();
      return {
        profileCompletionPercentage: Number(stats.profileCompletionPercentage),
        matchCount: Number(stats.matchCount),
      };
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export function useGetMatches() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMatches();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

export function useSearchProfiles() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filters: SearchFilters) => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchProfiles(filters);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["searchResults"], data);
    },
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicUser[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}
