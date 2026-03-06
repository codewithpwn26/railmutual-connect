import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useGetCallerUserProfile, useUpdateProfile } from "../hooks/useQueries";

const RAILWAY_ZONES = [
  "Central Railway",
  "Eastern Railway",
  "East Central Railway",
  "East Coast Railway",
  "Northern Railway",
  "North Central Railway",
  "North Eastern Railway",
  "Northeast Frontier Railway",
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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    fullName: "",
    department: "Indian Railways",
    designation: "",
    railwayZone: "",
    division: "",
    currentPostingLocation: "",
    desiredPostingLocation: "",
    contactVisible: false,
    email: "",
    phone: "",
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName ?? "",
        department: profile.department ?? "Indian Railways",
        designation: profile.designation ?? "",
        railwayZone: profile.railwayZone ?? "",
        division: profile.division ?? "",
        currentPostingLocation: profile.currentPostingLocation ?? "",
        desiredPostingLocation: profile.desiredPostingLocation ?? "",
        contactVisible: profile.contactVisible ?? false,
        email: profile.email ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    // Validate required fields
    if (!form.fullName.trim()) {
      return;
    }

    try {
      await updateProfile.mutateAsync({
        fullName: form.fullName.trim(),
        department: form.department || "Indian Railways",
        designation: form.designation.trim(),
        railwayZone: form.railwayZone,
        division: form.division.trim(),
        currentPostingLocation: form.currentPostingLocation.trim(),
        desiredPostingLocation: form.desiredPostingLocation.trim(),
        contactVisible: form.contactVisible,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      });

      setSaveSuccess(true);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 1200);
    } catch (err: unknown) {
      console.error("Profile save error:", err);
    }
  };

  const isLoading = profileLoading || actorFetching;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-poppins text-foreground">
          {profile?.fullName ? "Edit Profile" : "Complete Your Profile"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {profile?.fullName
            ? "Update your transfer preferences and contact details."
            : "Set up your profile to start finding mutual transfer matches."}
        </p>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Profile saved successfully! Redirecting to dashboard…
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {updateProfile.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {updateProfile.error instanceof Error
              ? updateProfile.error.message.includes("Unauthorized")
                ? "Session expired. Please log out and log in again."
                : updateProfile.error.message
              : "Failed to save profile. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={form.designation}
                onChange={(e) => handleChange("designation", e.target.value)}
                placeholder="e.g. Station Master"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => handleChange("department", e.target.value)}
                placeholder="e.g. Indian Railways"
              />
            </div>
          </div>
        </div>

        {/* Posting Details */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Posting Details</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="railwayZone">Railway Zone</Label>
              <Select
                value={form.railwayZone}
                onValueChange={(v) => handleChange("railwayZone", v)}
              >
                <SelectTrigger id="railwayZone">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {RAILWAY_ZONES.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="division">Division</Label>
              <Input
                id="division"
                value={form.division}
                onChange={(e) => handleChange("division", e.target.value)}
                placeholder="e.g. Mumbai Division"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currentPostingLocation">Current Posting</Label>
              <Input
                id="currentPostingLocation"
                value={form.currentPostingLocation}
                onChange={(e) =>
                  handleChange("currentPostingLocation", e.target.value)
                }
                placeholder="e.g. Mumbai CST"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desiredPostingLocation">Desired Posting</Label>
              <Input
                id="desiredPostingLocation"
                value={form.desiredPostingLocation}
                onChange={(e) =>
                  handleChange("desiredPostingLocation", e.target.value)
                }
                placeholder="e.g. New Delhi"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">
                <Mail className="w-3.5 h-3.5 inline mr-1" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">
                <Phone className="w-3.5 h-3.5 inline mr-1" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Contact Visibility Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mt-2">
            <div className="flex items-center gap-2">
              {form.contactVisible ? (
                <Eye className="w-4 h-4 text-primary" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  Show contact to matches
                </p>
                <p className="text-xs text-muted-foreground">
                  {form.contactVisible
                    ? "Your email and phone are visible to mutual matches"
                    : "Contact details are hidden from other users"}
                </p>
              </div>
            </div>
            <Switch
              checked={form.contactVisible}
              onCheckedChange={(v) => handleChange("contactVisible", v)}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={
            updateProfile.isPending || saveSuccess || !form.fullName.trim()
          }
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
