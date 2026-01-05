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
import { Badge } from "@/components/ui/badge";
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
    <Card className="ops-card border border-ops">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--brand-100))] dark:bg-[rgb(var(--brand-900))]">
              <Icon className="h-5 w-5 text-[rgb(var(--brand-600))]" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-ops-primary">
                {title}s
              </CardTitle>
              <CardDescription className="text-ops-secondary">
                {description}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => {
              addForm.reset();
              setIsAddDialogOpen(true);
            }}
            className="ops-btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun {title.toLowerCase()} n&apos;a été ajouté.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden sm:table-cell">Description</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-gray-500 max-w-50 truncate">
                    {resource.description || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {resource.isActive ? (
                      <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(resource)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
        )}
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Ajouter {title}</DialogTitle>
            <DialogDescription>
              Créez un nouveau {title.toLowerCase()} pour les formulaires
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(handleAdd)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Nom *</Label>
                <Input
                  id="add-name"
                  {...addForm.register("name")}
                  placeholder={`Nom du ${title.toLowerCase()}`}
                />
                {addForm.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {addForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  {...addForm.register("description")}
                  placeholder="Description optionnelle"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="add-isActive">Actif</Label>
                <Switch
                  id="add-isActive"
                  checked={addForm.watch("isActive")}
                  onCheckedChange={(checked) => addForm.setValue("isActive", checked)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createPending}>
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
            <DialogTitle>Modifier {title}</DialogTitle>
            <DialogDescription>
              Modifiez les informations du {title.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom *</Label>
                <Input
                  id="edit-name"
                  {...editForm.register("name")}
                  placeholder={`Nom du ${title.toLowerCase()}`}
                />
                {editForm.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  {...editForm.register("description")}
                  placeholder="Description optionnelle"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-isActive">Actif</Label>
                <Switch
                  id="edit-isActive"
                  checked={editForm.watch("isActive")}
                  onCheckedChange={(checked) => editForm.setValue("isActive", checked)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updatePending}>
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
