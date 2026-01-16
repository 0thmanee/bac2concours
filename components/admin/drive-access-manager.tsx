
"use client";

import { useState, useMemo } from "react";
import {
  FolderSync,
  Users,
  Shield,
  Eye,
  MessageSquare,
  Pencil,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserPlus,
  UserMinus,
  ChevronDown,
  Mail,
  Search,
  CheckSquare,
  Square,
  MinusSquare,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useDriveInfo,
  useGrantDriveAccess,
  useRevokeDriveAccess,
  type GrantAccessInput,
  type DrivePermission,
} from "@/lib/hooks/use-drive";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  paymentStatus: string;
}

// Role configuration
const ROLE_OPTIONS = [
  {
    value: "reader",
    label: "Lecteur",
    icon: Eye,
    description: "Voir et télécharger",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  {
    value: "commenter",
    label: "Commentateur",
    icon: MessageSquare,
    description: "Voir et commenter",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  {
    value: "writer",
    label: "Éditeur",
    icon: Pencil,
    description: "Modifier les fichiers",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
];

export function DriveAccessManager() {
  const { data: driveInfo, isLoading, refetch } = useDriveInfo();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"grant" | "revoke">("grant");

  const info = driveInfo?.data;

  if (isLoading) {
    return (
      <Card className="ops-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!info?.configured) {
    return (
      <Card className="ops-card border-warning/30 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Google Drive non configuré
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configurez les variables d&apos;environnement pour activer l&apos;intégration Google Drive.
          </p>
        </CardContent>
      </Card>
    );
  }

  const userPermissions = info.permissions?.filter((p) => p.type === "user") || [];

  return (
    <>
      <Card className="ops-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderSync className="h-5 w-5 text-brand-500" />
                Accès Google Drive
              </CardTitle>
              <CardDescription>
                Gérer l&apos;accès au dossier des livres
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Folder Info */}
          {info.folder && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-ops-card-secondary p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{info.folder.name}</p>
                <p className="text-xs text-muted-foreground">
                  {userPermissions.length} utilisateur{userPermissions.length !== 1 ? "s" : ""} avec accès
                </p>
              </div>
              <a
                href={info.folder.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-brand-500 hover:text-brand-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {/* Manage Access Button */}
          <Button
            className="w-full ops-btn-primary"
            onClick={() => setIsDialogOpen(true)}
          >
            <Shield className="mr-2 h-4 w-4" />
            Gérer les accès
          </Button>

          {/* Quick Stats */}
          {userPermissions.length > 0 && (
            <>
            <div className="grid grid-cols-2 gap-2 text-center">
              {ROLE_OPTIONS.slice(0, 2).map((role) => {
                const count = userPermissions.filter((p) => p.role === role.value).length;
                return (
                  <div key={role.value} className={cn("rounded-lg p-2", role.bg)}>
                    <p className={cn("text-lg font-semibold", role.color)}>{count}</p>
                    <p className="text-xs text-muted-foreground">{role.label}s</p>
                  </div>
                );
              })}
            </div>
            {ROLE_OPTIONS.slice(2).map((role) => {
                const count = userPermissions.filter((p) => p.role === role.value).length;
                return (
                  <div key={role.value} className={cn("rounded-lg p-2 flex flex-col items-center", role.bg)}>
                    <p className={cn("text-lg font-semibold", role.color)}>{count}</p>
                    <p className="text-xs text-muted-foreground">{role.label}s</p>
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Full Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FolderSync className="h-5 w-5 text-brand-500" />
              Gestion des accès Google Drive
            </DialogTitle>
            <DialogDescription>
              Accordez ou révoquez l&apos;accès au dossier des livres
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 shrink-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grant" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Accorder l&apos;accès
                </TabsTrigger>
                <TabsTrigger value="revoke" className="gap-2">
                  <UserMinus className="h-4 w-4" />
                  Révoquer l&apos;accès
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grant" className="flex-1 overflow-hidden m-0 px-6 pb-6">
              <GrantAccessPanel
                onSuccess={() => {
                  refetch();
                }}
                existingPermissions={userPermissions}
              />
            </TabsContent>

            <TabsContent value="revoke" className="flex-1 overflow-hidden m-0 px-6 pb-6">
              <RevokeAccessPanel
                permissions={userPermissions}
                onSuccess={() => {
                  refetch();
                }}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================
// GRANT ACCESS PANEL
// ============================================================

interface GrantAccessPanelProps {
  onSuccess: () => void;
  existingPermissions: DrivePermission[];
}

function GrantAccessPanel({ onSuccess, existingPermissions }: GrantAccessPanelProps) {
  const grantAccessMutation = useGrantDriveAccess();

  // State
  const [role, setRole] = useState<"reader" | "commenter" | "writer">("reader");
  const [targetFilter] = useState<"approved" | "active" | "all">("approved");
  const [sendNotification, setSendNotification] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Fetch users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => apiClient.get<{ data: { users: User[] } }>(API_ROUTES.USERS + "?limit=1000"),
  });

  const allUsers = usersData?.data?.users || [];

  // Existing emails (users who already have access)
  const existingEmails = useMemo(() => {
    return new Set(existingPermissions.map((p) => p.email.toLowerCase()));
  }, [existingPermissions]);

  // Filter users based on target filter
  const filteredByTarget = useMemo(() => {
    let users = allUsers;
    switch (targetFilter) {
      case "approved":
        users = users.filter((u) => u.status === "ACTIVE" && u.paymentStatus === "APPROVED");
        break;
      case "active":
        users = users.filter((u) => u.status === "ACTIVE");
        break;
    }
    return users;
  }, [allUsers, targetFilter]);

  // Available users (excluding those who already have access)
  const availableUsers = useMemo(() => {
    return filteredByTarget.filter((u) => !existingEmails.has(u.email.toLowerCase()));
  }, [filteredByTarget, existingEmails]);

  // Search filtered users
  const displayedUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;
    const query = searchQuery.toLowerCase();
    return availableUsers.filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
  }, [availableUsers, searchQuery]);

  // Valid selected IDs (only those in availableUsers)
  const availableUserIds = useMemo(() => new Set(availableUsers.map((u) => u.id)), [availableUsers]);
  const validSelectedIds = useMemo(() => {
    return new Set(Array.from(selectedUserIds).filter((id) => availableUserIds.has(id)));
  }, [selectedUserIds, availableUserIds]);

  // Selection state helpers
  const allSelected = displayedUsers.length > 0 && displayedUsers.every((u) => selectedUserIds.has(u.id));
  const someSelected = displayedUsers.some((u) => selectedUserIds.has(u.id));
  const selectedCount = validSelectedIds.size;

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      // Deselect all displayed users
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        displayedUsers.forEach((u) => next.delete(u.id));
        return next;
      });
    } else {
      // Select all displayed users
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        displayedUsers.forEach((u) => next.add(u.id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedUserIds(new Set());
  };

  const handleGrant = async () => {
    if (selectedCount === 0) {
      toast.warning("Veuillez sélectionner au moins un utilisateur");
      return;
    }

    const input: GrantAccessInput = {
      role,
      userIds: Array.from(validSelectedIds),
      sendNotification,
      emailMessage: emailMessage.trim() || undefined,
    };

    try {
      const result = await grantAccessMutation.mutateAsync(input);
      const data = result.data;

      if (data.successful > 0) {
        toast.success(`Accès accordé à ${data.successful} utilisateur${data.successful > 1 ? "s" : ""}`);
      }
      if (data.skipped > 0) {
        toast.info(`${data.skipped} avaient déjà accès`);
      }
      if (data.failed > 0) {
        toast.error(`Échec pour ${data.failed} utilisateur${data.failed > 1 ? "s" : ""}`);
      }

      onSuccess();
      clearSelection();
    } catch {
      toast.error("Erreur lors de l'attribution de l'accès");
    }
  };

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role)!;

  return (
    <div className="flex flex-col h-full pt-4 gap-4">
      {/* Top Section: Role & Filter */}
        {/* Role Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Niveau d&apos;accès</Label>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value as typeof role)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all",
                  role === opt.value
                    ? cn("border-current", opt.color, opt.bg)
                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                )}
              >
                <opt.icon className={cn("h-4 w-4", opt.color)} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

      {/* User Selection Section */}
      <div className="flex-1 min-h-0 flex flex-col border rounded-lg overflow-hidden">
        {/* Header with Search and Select All - Same layout as revoke */}
        <div className="p-3 space-y-2 bg-muted/30 border-b shrink-0">
          {/* Select All Checkbox and Counter on same row */}
          <div className="flex items-center justify-between h-8">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 hover:opacity-80 shrink-0"
            >
              {allSelected ? (
                <CheckSquare className="h-5 w-5 text-brand-500" />
              ) : someSelected ? (
                <MinusSquare className="h-5 w-5 text-brand-500" />
              ) : (
                <Square className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
              </span>
            </button>

            {/* Selection Counter */}
            {selectedCount > 0 && (
              <Badge variant="secondary" className="shrink-0">
                {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Search Input on its own row */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* User List */}
        <ScrollArea className="flex-1">
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery ? "Aucun résultat trouvé" : "Aucun utilisateur disponible"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? "Essayez une autre recherche" : "Tous les utilisateurs ont déjà accès"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {displayedUsers.map((user) => {
                const isSelected = selectedUserIds.has(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                      isSelected ? "bg-brand-500/5" : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      className={cn(
                        "shrink-0",
                        isSelected && "border-brand-500 data-[state=checked]:bg-brand-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {user.paymentStatus === "APPROVED" && (
                        <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                          Payé
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Advanced Options */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="shrink-0">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between h-8">
            <span className="text-xs">Options avancées</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", isAdvancedOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="notification" className="text-sm">Notification email</Label>
              <p className="text-xs text-muted-foreground">Google enverra un email</p>
            </div>
            <Switch
              id="notification"
              checked={sendNotification}
              onCheckedChange={setSendNotification}
            />
          </div>
          {sendNotification && (
            <Textarea
              placeholder="Message personnalisé (optionnel)..."
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              rows={2}
              maxLength={500}
              className="resize-none text-sm"
            />
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Footer Action */}
      <div className="flex items-center justify-between pt-3 border-t shrink-0">
        <div className="text-sm">
          {selectedCount > 0 ? (
            <>
              <span className="font-semibold">{selectedCount}</span>
              <span className="text-muted-foreground"> utilisateur{selectedCount > 1 ? "s" : ""} • </span>
              <span className={cn("font-medium", selectedRole.color)}>{selectedRole.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Sélectionnez des utilisateurs</span>
          )}
        </div>
        <Button
          onClick={handleGrant}
          disabled={grantAccessMutation.isPending || selectedCount === 0}
          className={cn("gap-2", selectedRole.bg, selectedRole.color, "hover:opacity-90 border", selectedRole.border)}
        >
          {grantAccessMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Attribution...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Accorder l&apos;accès
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// REVOKE ACCESS PANEL
// ============================================================

interface RevokeAccessPanelProps {
  permissions: DrivePermission[];
  onSuccess: () => void;
}

function RevokeAccessPanel({ permissions, onSuccess }: RevokeAccessPanelProps) {
  const revokeAccessMutation = useRevokeDriveAccess();

  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  // Check if a permission is protected (owner or service account)
  const isProtected = (perm: DrivePermission) => {
    return perm.type === "owner" || perm.email.includes(".iam.gserviceaccount.com");
  };

  // Search filtered permissions
  const displayedPermissions = useMemo(() => {
    if (!searchQuery.trim()) return permissions;
    const query = searchQuery.toLowerCase();
    return permissions.filter(
      (p) => p.email.toLowerCase().includes(query) || p.displayName?.toLowerCase().includes(query)
    );
  }, [permissions, searchQuery]);

  // Selectable permissions (exclude protected)
  const selectablePermissions = useMemo(() => {
    return displayedPermissions.filter((p) => !isProtected(p));
  }, [displayedPermissions]);

  // Selection state helpers (only count selectable)
  const allSelected = selectablePermissions.length > 0 && selectablePermissions.every((p) => selectedEmails.has(p.email));
  const someSelected = selectablePermissions.some((p) => selectedEmails.has(p.email));
  const selectedCount = selectedEmails.size;

  const toggleEmail = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedEmails((prev) => {
        const next = new Set(prev);
        selectablePermissions.forEach((p) => next.delete(p.email));
        return next;
      });
    } else {
      setSelectedEmails((prev) => {
        const next = new Set(prev);
        selectablePermissions.forEach((p) => next.add(p.email));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedEmails(new Set());
  };

  const handleRevoke = async () => {
    if (selectedCount === 0) return;

    setIsRevoking(true);
    let successCount = 0;
    let failCount = 0;

    for (const email of selectedEmails) {
      try {
        await revokeAccessMutation.mutateAsync({ email });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsRevoking(false);

    if (successCount > 0) {
      toast.success(`Accès révoqué pour ${successCount} utilisateur${successCount > 1 ? "s" : ""}`);
    }
    if (failCount > 0) {
      toast.error(`Échec pour ${failCount} utilisateur${failCount > 1 ? "s" : ""}`);
    }

    onSuccess();
    clearSelection();
  };

  const getRoleConfig = (role: string) => {
    return ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0];
  };

  if (permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Users className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium">Aucun utilisateur avec accès</p>
        <p className="text-xs text-muted-foreground mt-1">
          Accordez d&apos;abord l&apos;accès à des utilisateurs
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pt-4 gap-4">
      {/* User Selection Section */}
      <div className="flex-1 min-h-0 flex flex-col border rounded-lg overflow-hidden">
        {/* Header with Search and Select All */}
        <div className="p-3 space-y-2 bg-muted/30 border-b shrink-0">
          {/* Select All Checkbox */}
          <div className="flex items-center justify-between h-8">
            <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-2 hover:opacity-80 shrink-0"
          >
            {allSelected ? (
              <CheckSquare className="h-5 w-5 text-destructive" />
            ) : someSelected ? (
              <MinusSquare className="h-5 w-5 text-destructive" />
            ) : (
              <Square className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </span>
          </button>

          {/* Selection Counter */}
          {selectedCount > 0 && (
            <Badge variant="destructive" className="shrink-0">
              {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
            </Badge>
          )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Permissions List */}
        <ScrollArea className="flex-1">
          {displayedPermissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Aucun résultat trouvé</p>
              <p className="text-xs text-muted-foreground mt-1">Essayez une autre recherche</p>
            </div>
          ) : (
            <div className="divide-y">
              {displayedPermissions.map((perm) => {
                const isSelected = selectedEmails.has(perm.email);
                const roleConfig = getRoleConfig(perm.role);
                const permIsProtected = isProtected(perm);
                const isOwner = perm.type === "owner";
                return (
                  <div
                    key={perm.id}
                    onClick={() => !permIsProtected && toggleEmail(perm.email)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors",
                      permIsProtected
                        ? "bg-muted/30 cursor-not-allowed opacity-60"
                        : isSelected
                        ? "bg-destructive/5 cursor-pointer"
                        : "hover:bg-muted/50 cursor-pointer"
                    )}
                  >
                    {permIsProtected ? (
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <Checkbox
                        checked={isSelected}
                        className={cn(
                          "shrink-0",
                          isSelected && "border-destructive data-[state=checked]:bg-destructive"
                        )}
                      />
                    )}
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {perm.displayName || perm.email}
                      </p>
                      {perm.displayName && (
                        <p className="text-xs text-muted-foreground truncate">{perm.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {permIsProtected && (
                        <Badge variant="outline" className="text-[10px] border-muted-foreground/30">
                          {isOwner ? "Propriétaire" : "Service"}
                        </Badge>
                      )}
                      <Badge variant="secondary" className={cn("text-[10px]", roleConfig.bg, roleConfig.color)}>
                        <roleConfig.icon className="h-3 w-3 mr-1" />
                        {roleConfig.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer Action */}
      <div className="flex items-center justify-between pt-3 border-t shrink-0">
        <div className="text-sm">
          {selectedCount > 0 ? (
            <>
              <span className="font-semibold text-destructive">{selectedCount}</span>
              <span className="text-muted-foreground"> utilisateur{selectedCount > 1 ? "s" : ""} à révoquer</span>
            </>
          ) : (
            <span className="text-muted-foreground">Sélectionnez des utilisateurs</span>
          )}
        </div>
        <Button
          variant="destructive"
          onClick={handleRevoke}
          disabled={isRevoking || selectedCount === 0}
          className="gap-2"
        >
          {isRevoking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Révocation...
            </>
          ) : (
            <>
              <UserMinus className="h-4 w-4" />
              Révoquer l&apos;accès
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
