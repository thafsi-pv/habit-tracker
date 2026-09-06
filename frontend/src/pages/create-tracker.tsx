import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCreateTracker } from '@/hooks/use-trackers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PendingInvitations } from '@/components/pending-invitations';

const schema = z.object({ name: z.string().min(1, 'Give your tracker a name').max(80) });
type FormValues = z.infer<typeof schema>;

export default function CreateTracker() {
  const createTracker = useCreateTracker();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: 'My Daily Routine' } });

  const onSubmit = async (values: FormValues) => {
    try {
      const tracker = await createTracker.mutateAsync(values.name);
      localStorage.setItem('habit-tracker:active-tracker-id', tracker.id);
      toast.success('Tracker created — add your first habit!');
      navigate('/', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Could not create tracker');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-10">
      <PendingInvitations />
      <div className="space-y-2 text-center">
        <p className="text-3xl">🌱</p>
        <h1 className="text-2xl font-semibold">Create your tracker</h1>
        <p className="text-muted-foreground">
          You can use it completely alone, and invite people later.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Tracker name</Label>
          <Input id="name" placeholder="Morning Routine" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create Tracker'}
        </Button>
      </form>
    </div>
  );
}
