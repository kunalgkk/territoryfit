import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRegisterFitnessProfile } from '../../hooks/useQueries';
import { Loader2, User } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    gender: '',
    heightCm: '',
    weightKg: '',
    primaryGoal: '',
  });

  const registerProfile = useRegisterFitnessProfile();

  const handleSubmit = async () => {
    if (!form.fullName || !form.age || !form.gender || !form.heightCm || !form.weightKg || !form.primaryGoal) return;
    await registerProfile.mutateAsync({
      fullName: form.fullName,
      age: BigInt(parseInt(form.age)),
      gender: form.gender,
      heightCm: BigInt(parseInt(form.heightCm)),
      weightKg: BigInt(parseInt(form.weightKg)),
      primaryGoal: form.primaryGoal,
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="bg-card border-border max-w-md" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Set Up Your Profile</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Step {step} of 2 — Personalize your experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Full Name</Label>
              <Input
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Your name"
                className="bg-input border-border text-foreground mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-foreground">Age</Label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  placeholder="25"
                  className="bg-input border-border text-foreground mt-1"
                />
              </div>
              <div>
                <Label className="text-foreground">Gender</Label>
                <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!form.fullName || !form.age || !form.gender}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-foreground">Height (cm)</Label>
                <Input
                  type="number"
                  value={form.heightCm}
                  onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))}
                  placeholder="170"
                  className="bg-input border-border text-foreground mt-1"
                />
              </div>
              <div>
                <Label className="text-foreground">Weight (kg)</Label>
                <Input
                  type="number"
                  value={form.weightKg}
                  onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
                  placeholder="70"
                  className="bg-input border-border text-foreground mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground">Primary Fitness Goal</Label>
              <Select value={form.primaryGoal} onValueChange={v => setForm(f => ({ ...f, primaryGoal: v }))}>
                <SelectTrigger className="bg-input border-border text-foreground mt-1">
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!form.heightCm || !form.weightKg || !form.primaryGoal || registerProfile.isPending}
              >
                {registerProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Start Playing
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
