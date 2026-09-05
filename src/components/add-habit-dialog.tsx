import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCreateHabit } from '@/hooks/use-trackers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Give the habit a name').max(80),
  icon: z.string().max(8).optional(),
});
type FormValues = z.infer<typeof schema>;

export function AddHabitDialog({ trackerId }: { trackerId: string }) {
  const [open, setOpen] = React.useState(false);
  const createHabit = useCreateHabit(trackerId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await createHabit.mutateAsync(values);
      toast.success('Habit added');
      reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Could not add habit');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4" /> Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <div className="w-16 space-y-1.5">
              <Label htmlFor="icon">Icon</Label>
              <Input id="icon" placeholder="🙏" {...register('icon')} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Prayer" {...register('name')} />
            </div>
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding…' : 'Add Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
