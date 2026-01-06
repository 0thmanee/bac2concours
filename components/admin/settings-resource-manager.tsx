"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/error.utils";
import type { LucideIcon } from "lucide-react";

// Generic resource type
interface Resource {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

// Form schema for creating/editing resources
const resourceFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  description: z.string().max(500, "La description est trop longue").optional().or(z.literal("")),
  isActive: z.boolean(),
});

type ResourceFormData = z.infer<typeof resourceFormSchema>;

interface SettingsResourceManagerProps<T extends Resource> {
  title: string;
  description: string;
  icon: LucideIcon;
  resources: T[];
  isLoading: boolean;
  onCreate: (data: ResourceFormData) => Promise<void>;
  onUpdate: (id: string, data: ResourceFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  createPending: boolean;
  updatePending: boolean;
  deletePending: boolean;
}

export function SettingsResourceManager<T extends Resource>({
  title,
  description,
  icon: Icon,
  resources,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  createPending,
  updatePending,
  deletePending,
}: SettingsResourceManagerProps<T>) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<T | null>(null);

  const addForm = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const editForm = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const handleAdd = async (data: ResourceFormData) => {
    try {
      await onCreate(data);
      toast.success(`${title} créé avec succès`);
      setIsAddDialogOpen(false);
      addForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = async (data: ResourceFormData) => {
    if (!selectedResource) return;
    try {
      await onUpdate(selectedResource.id, data);
      toast.success(`${title} mis à jour avec succès`);
      setIsEditDialogOpen(false);
      setSelectedResource(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!selectedResource) return;
    try {
      await onDelete(selectedResource.id);
      toast.success(`${title} supprimé avec succès`);
      setIsDeleteDialogOpen(false);
      setSelectedResource(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openEditDialog = (resource: T) => {
    setSelectedResource(resource);
    editForm.reset({
      name: resource.name,
      description: resource.description || "",
      isActive: resource.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (resource: T) => {
    setSelectedResource(resource);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="ops-card border border-border">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--brand-100))] dark:bg-[rgb(var(--brand-900))] shrink-0">
              <Icon className="h-5 w-5 text-[rgb(var(--brand-600))]" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold text-ops-primary">
                {title}s
              </CardTitle>
              <CardDescription className="text-ops-secondary text-sm">
                {description}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => {
              addForm.reset();
              setIsAddDialogOpen(true);
            }}
            className="ops-btn-primary w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-ops-tertiary" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8 text-ops-tertiary">
            Aucun {title.toLowerCase()} n&apos;a été ajouté.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="text-ops-secondary font-medium text-xs uppercase tracking-wider">Nom</TableHead>
                  <TableHead className="hidden sm:table-cell text-ops-secondary font-medium text-xs uppercase tracking-wider">Description</TableHead>
                  <TableHead className="text-center text-ops-secondary font-medium text-xs uppercase tracking-wider">Statut</TableHead>
                  <TableHead className="text-right text-ops-secondary font-medium text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id} className="border-b border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-ops-primary">{resource.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-ops-secondary max-w-[200px] truncate">
                      {resource.description || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {resource.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md bg-linear-to-r from-gray-50 to-gray-100 text-gray-600 border border-border">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => openEditDialog(resource)}
                        >
                          <Pencil className="h-4 w-4 text-ops-secondary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDeleteDialog(resource)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-ops-primary">Ajouter {title}</DialogTitle>
            <DialogDescription className="text-sm text-ops-secondary">
              Créez un nouveau {title.toLowerCase()} pour les formulaires
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(handleAdd)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name" className="text-sm font-medium text-ops-primary">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-name"
                  {...addForm.register("name")}
                  placeholder={`Nom du ${title.toLowerCase()}`}
                  className="ops-input h-9"
                />
                {addForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {addForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-description" className="text-sm font-medium text-ops-primary">
                  Description <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <Textarea
                  id="add-description"
                  {...addForm.register("description")}
                  placeholder="Description optionnelle"
                  rows={3}
                  className="ops-input resize-none"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <Label htmlFor="add-isActive" className="text-sm font-medium text-ops-primary cursor-pointer">
                  Actif
                </Label>
                <Switch
                  id="add-isActive"
                  checked={addForm.watch("isActive")}
                  onCheckedChange={(checked) => addForm.setValue("isActive", checked)}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border-border"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createPending} className="ops-btn-primary">
                {createPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-ops-primary">Modifier {title}</DialogTitle>
            <DialogDescription className="text-sm text-ops-secondary">
              Modifiez les informations du {title.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium text-ops-primary">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  {...editForm.register("name")}
                  placeholder={`Nom du ${title.toLowerCase()}`}
                  className="ops-input h-9"
                />
                {editForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium text-ops-primary">
                  Description <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <Textarea
                  id="edit-description"
                  {...editForm.register("description")}
                  placeholder="Description optionnelle"
                  rows={3}
                  className="ops-input resize-none"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <Label htmlFor="edit-isActive" className="text-sm font-medium text-ops-primary cursor-pointer">
                  Actif
                </Label>
                <Switch
                  id="edit-isActive"
                  checked={editForm.watch("isActive")}
                  onCheckedChange={(checked) => editForm.setValue("isActive", checked)}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-border"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updatePending} className="ops-btn-primary">
                {updatePending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {title}</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{selectedResource?.name}&quot; ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletePending}
            >
              {deletePending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
