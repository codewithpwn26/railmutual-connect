import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Mail,
  MapPin,
  Phone,
  Train,
  User,
} from "lucide-react";
import { useState } from "react";
import type { Profile } from "../backend";

interface MatchCardProps {
  profile: Profile;
}

export default function MatchCard({ profile }: MatchCardProps) {
  const [showContact, setShowContact] = useState(false);

  return (
    <Card className="shadow-card border-border hover:shadow-card-hover transition-all duration-200 overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary-600 to-orange-500" />

      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-base leading-tight">
                {profile.fullName || "Railway Employee"}
              </h3>
              {profile.designation && (
                <p className="text-muted-foreground text-xs mt-0.5">
                  {profile.designation}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-xs bg-primary-50 text-primary-700 border-primary-100 flex-shrink-0"
          >
            Mutual Match
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {profile.railwayZone && (
            <div className="flex items-center gap-2">
              <Train className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Zone</p>
                <p className="text-sm font-medium text-foreground">
                  {profile.railwayZone}
                </p>
              </div>
            </div>
          )}
          {profile.division && (
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Division</p>
                <p className="text-sm font-medium text-foreground">
                  {profile.division}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Posting Swap */}
        <div className="bg-secondary rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">
                Currently at
              </p>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-primary-700 truncate">
                  {profile.currentPostingLocation || "—"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">
                Wants to go to
              </p>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-orange-600 truncate">
                  {profile.desiredPostingLocation || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <Button
          onClick={() => setShowContact(!showContact)}
          className={`w-full gap-2 font-medium ${
            showContact
              ? "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
              : "bg-primary-700 hover:bg-primary-800 text-white border-0"
          }`}
          size="sm"
        >
          {showContact ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Contact
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Connect
            </>
          )}
        </Button>

        {/* Contact Details (revealed on click) */}
        {showContact && (
          <div className="mt-3 p-3 bg-primary-50 rounded-xl border border-primary-100 animate-fade-in">
            {profile.contactVisible ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
                  Contact Details
                </p>
                {profile.email ? (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-sm text-primary-700 hover:text-primary-900 font-medium hover:underline"
                    >
                      {profile.email}
                    </a>
                  </div>
                ) : null}
                {profile.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                    <a
                      href={`tel:${profile.phone}`}
                      className="text-sm text-primary-700 hover:text-primary-900 font-medium hover:underline"
                    >
                      {profile.phone}
                    </a>
                  </div>
                ) : null}
                {!profile.email && !profile.phone && (
                  <p className="text-sm text-muted-foreground italic">
                    No contact details provided.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <EyeOff className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">
                  This employee has chosen to keep their contact details
                  private.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
