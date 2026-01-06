import { useForm as useHookForm, UseFormProps, FieldValues, DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCallback } from 'react'

export interface SuperFormOptions<TFieldValues extends FieldValues> extends Omit<UseFormProps<TFieldValues>, 'resolver'> {
  schema: z.ZodSchema<TFieldValues>
  onSubmit: (data: TFieldValues) => Promise<void> | void
  onSuccess?: (data: TFieldValues) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  resetOnSuccess?: boolean
}

/**
 * Enhanced useForm hook with built-in validation, error handling, and toast notifications
 * This provides "superform" functionality with React Hook Form + Zod
 * 
 * @example
 * ```tsx
 * const form = useSuperForm({
 *   schema: createStartupSchema,
 *   onSubmit: async (data) => {
 *     await createStartup.mutateAsync(data)
 *   },
 *   successMessage: "Startup created successfully!",
 *   resetOnSuccess: true
 * })
 * 
 * return <form onSubmit={form.handleFormSubmit}>...</form>
 * ```
 */
export function useSuperForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  onSubmit,
  onSuccess,
  onError,
  successMessage = 'Operation completed successfully',
  errorMessage = 'An error occurred',
  resetOnSuccess = false,
  ...options
}: SuperFormOptions<TFieldValues>) {
  const form = useHookForm<TFieldValues>({
    ...options,
    // Known Zod v4 compatibility issue with @hookform/resolvers - types are incompatible but runtime works
    // @ts-expect-error - Zod v4 type incompatibility with zodResolver
    resolver: zodResolver(schema),
  })

  const handleFormSubmit = useCallback((e?: React.BaseSyntheticEvent) => {
    return form.handleSubmit(
      async (data) => {
        // Cast through unknown to satisfy TypeScript's generic type checking
        // This is safe because react-hook-form guarantees the data matches TFieldValues
        const typedData = data as unknown as TFieldValues
        try {
          await onSubmit(typedData)
          
          if (successMessage) {
            toast.success(successMessage)
          }
          
          if (resetOnSuccess) {
            form.reset(options.defaultValues as DefaultValues<TFieldValues>)
          }
          
          if (onSuccess) {
            onSuccess(typedData)
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : errorMessage
          toast.error(message)
          if (onError) {
            onError(error instanceof Error ? error : new Error(message))
          }
        }
      },
      (errors) => {
        // Show first validation error
        const firstError = Object.values(errors)[0]
        if (firstError?.message) {
          toast.error(String(firstError.message))
        }
      }
    )(e)
  }, [form, onSubmit, onSuccess, onError, successMessage, errorMessage, resetOnSuccess, options.defaultValues])

  return {
    ...form,
    handleFormSubmit,
    isSubmitting: form.formState.isSubmitting,
  }
}

/**
 * Simple form field component for consistent styling
 */
export interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  description?: string
  children: React.ReactNode
}

export function FormField({ label, error, required, description, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-[rgb(var(--error))] ml-1">*</span>}
        </label>
      )}
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-[rgb(var(--error))]">{error}</p>
      )}
    </div>
  )
}
