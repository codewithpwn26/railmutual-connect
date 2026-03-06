import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeFilter } from "@/lib/textUtils";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  RefreshCw,
  Search,
  Train,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile } from "../backend";
import MatchCard from "../components/MatchCard";
import { useGetMatches, useSearchProfiles } from "../hooks/useQueries";

const RAILWAY_ZONES = [
  "All Zones",
  "Central Railway",
  "Eastern Railway",
  "East Central Railway",
  "East Coast Railway",
  "Northern Railway",
  "North Central Railway",
  "Northeast Frontier Railway",
  "North Eastern Railway",
  "North Western Railway",
  "Southern Railway",
  "South Central Railway",
  "South Eastern Railway",
  "South East Central Railway",
  "South Western Railway",
  "Western Railway",
  "West Central Railway",
  "Metro Railway Kolkata",
];

interface Filters {
  zone: string;
  division: string;
  location: string;
  designation: string;
}

const EMPTY_FILTERS: Filters = {
  zone: "",
  division: "",
  location: "",
  designation: "",
};

/** Debounce delay in milliseconds for live search */
const SEARCH_DEBOUNCE_MS = 350;

export default function MatchesPage() {
  const { data: mutualMatches, isLoading: matchesLoading } = useGetMatches();
  const searchProfiles = useSearchProfiles();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile[] | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Runs the search with normalized filter values.
   * Normalization: lowercase, trim, collapse multiple spaces.
   */
  const runSearch = useCallback(
    async (currentFilters: Filters) => {
      const normalizedZone = normalizeFilter(currentFilters.zone);
      const normalizedDivision = normalizeFilter(currentFilters.division);
      const normalizedLocation = normalizeFilter(currentFilters.location);
      const normalizedDesignation = normalizeFilter(currentFilters.designation);

      // If no filters are active, clear search results
      const anyActive =
        normalizedZone !== undefined ||
        normalizedDivision !== undefined ||
        normalizedLocation !== undefined ||
        normalizedDesignation !== undefined;

      if (!anyActive) {
        setSearchResults(null);
        return;
      }

      setIsFiltering(true);
      try {
        const results = await searchProfiles.mutateAsync({
          zone: normalizedZone,
          division: normalizedDivision,
          location: normalizedLocation,
          designation: normalizedDesignation,
        });
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsFiltering(false);
      }
    },
    [searchProfiles],
  );

  // Debounced live search: triggers automatically when filters change
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      runSearch(filters);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filters, runSearch]);

  const handleSearch = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    runSearch(filters);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchResults(null);
  };

  /**
   * Build the displayed profiles list:
   * - When no filters active: show mutual matches only.
   * - When filters active: merge mutual matches (always visible) with search results,
   *   deduplicating by userId. Mutual matches appear first.
   */
  const displayedProfiles: Profile[] = (() => {
    const mutual = mutualMatches || [];

    if (!hasActiveFilters || searchResults === null) {
      return mutual;
    }

    // Mutual matches always included; append non-mutual search results after
    const mutualIds = new Set(mutual.map((p) => p.userId.toString()));
    const additionalResults = searchResults.filter(
      (p) => !mutualIds.has(p.userId.toString()),
    );
    return [...mutual, ...additionalResults];
  })();

  const isLoading = matchesLoading || isFiltering;

  const mutualCount = mutualMatches?.length ?? 0;
  const searchOnlyCount = searchResults
    ? searchResults.filter(
        (p) =>
          !(mutualMatches || []).some(
            (m) => m.userId.toString() === p.userId.toString(),
          ),
      ).length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="font-display font-bold text-foreground text-2xl sm:text-3xl">
          Mutual Matches
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {hasActiveFilters && searchResults !== null
            ? `Showing ${mutualCount} mutual match${mutualCount !== 1 ? "es" : ""} + ${searchOnlyCount} additional result${searchOnlyCount !== 1 ? "s" : ""} from filters`
            : "Employees who want to swap postings with you"}
        </p>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-card rounded-xl border border-border shadow-card mb-4 md:mb-6">
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors rounded-xl"
              aria-expanded={filtersOpen}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-600" />
                <span className="font-semibold text-foreground text-sm">
                  Advanced Filters
                </span>
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                  >
                    Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Filters narrow down results.
                </span>
                {filtersOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-5 pb-5 pt-1 border-t border-border">
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Filters narrow down results. Mutual matches are always shown
                regardless of filters.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                {/* Zone Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Railway Zone
                  </Label>
                  <Select
                    value={filters.zone || "all"}
                    onValueChange={(val) =>
                      handleFilterChange("zone", val === "all" ? "" : val)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Zones" />
                    </SelectTrigger>
                    <SelectContent>
                      {RAILWAY_ZONES.map((zone) => (
                        <SelectItem
                          key={zone}
                          value={zone === "All Zones" ? "all" : zone}
                        >
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Division Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Division
                  </Label>
                  <Input
                    value={filters.division}
                    onChange={(e) =>
                      handleFilterChange("division", e.target.value)
                    }
                    placeholder="e.g. Mumbai, Delhi"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Location Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Location
                  </Label>
                  <Input
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    placeholder="e.g. Mumbai CST"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Designation Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Designation
                  </Label>
                  <Input
                    value={filters.designation}
                    onChange={(e) =>
                      handleFilterChange("designation", e.target.value)
                    }
                    placeholder="e.g. Station Master"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={isFiltering}
                  className="bg-primary-700 hover:bg-primary-800 text-white border-0 gap-2 h-9"
                  size="sm"
                >
                  {isFiltering ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  Search Profiles
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="gap-1.5 h-9 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Results summary row */}
      <div className="flex items-center gap-3 mb-3 md:mb-5">
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary-700 text-white">
          <Users className="w-4 h-4" />
          Mutual Matches
          {mutualCount > 0 && (
            <span className="text-xs rounded-full px-1.5 py-0.5 font-medium bg-orange-500 text-white">
              {mutualCount}
            </span>
          )}
        </div>
        {hasActiveFilters && searchResults !== null && searchOnlyCount > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground">
            <Search className="w-4 h-4" />
            Additional Results
            <span className="text-xs rounded-full px-1.5 py-0.5 font-medium bg-muted text-muted-foreground">
              {searchOnlyCount}
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
          {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
            <div
              key={key}
              className="bg-card rounded-xl border border-border p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : displayedProfiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
          {displayedProfiles.map((profile) => (
            <MatchCard key={profile.userId.toString()} profile={profile} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <Train className="w-8 h-8 text-primary-300" />
          </div>
          <h3 className="font-display font-semibold text-foreground text-lg mb-2">
            No mutual matches yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            No matches found. Make sure your current and desired posting
            locations are filled in your profile. Check back later as more
            employees join!
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-4 gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
