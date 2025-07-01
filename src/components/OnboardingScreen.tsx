
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, Calendar, ArrowRight, Check, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddressAutocomplete from './AddressAutocomplete';
import DatePicker from './DatePicker';

interface OnboardingScreenProps {
  user: any;
  onComplete: (userData: any) => void;
}

const OCCUPATIONS = [
  'Architect',
  'Building Inspector',
  'Building Regulations Inspector',
  'Building Control Officer',
  'Builder',
  'Construction Manager',
  'Structural Engineer',
  'Civil Engineer',
  'Quantity Surveyor',
  'Planning Consultant',
  'Project Manager',
  'Site Manager',
  'Contractor',
  'Subcontractor',
  'Developer',
  'Property Developer',
  'Homeowner',
  'Student',
  'Other'
];

const OnboardingScreen = ({ user, onComplete }: OnboardingScreenProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    occupation: '',
    dateOfBirth: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      console.log('Starting onboarding submission for user:', user.id);
      console.log('Form data:', formData);

      // Store profile data in Supabase profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: user.name, // Use the name from auth signup
          address: formData.address,
          occupation: formData.occupation,
          date_of_birth: formData.dateOfBirth
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Profile creation/update error:', profileError);
        throw profileError;
      }

      console.log('Profile data saved successfully');

      // Update user metadata to mark onboarding as completed
      const { error: userError } = await supabase.auth.updateUser({
        data: { 
          onboarding_completed: true
        }
      });

      if (userError) {
        console.error('User metadata update error:', userError);
        throw userError;
      }

      console.log('User metadata updated successfully');

      const userData = {
        ...user,
        address: formData.address,
        occupation: formData.occupation,
        dateOfBirth: formData.dateOfBirth,
        onboardingCompleted: true
      };

      onComplete(userData);

      toast({
        title: "Welcome to EezyBuild!",
        description: "Your profile has been set up successfully.",
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.address.trim() !== '';
      case 2: return formData.occupation !== '';
      case 3: return formData.dateOfBirth !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <MapPin className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Where are you located?</h2>
              <p className="text-gray-400">We'll help you with local building regulations</p>
            </div>
            
            <div className="space-y-4">
              <Label className="text-emerald-300">Address</Label>
              
              {!showManualAddress ? (
                <div className="space-y-3">
                  <AddressAutocomplete
                    value={formData.address}
                    onChange={(value) => handleInputChange('address', value)}
                    className="bg-gray-800/50 border-emerald-500/30 text-white placeholder-gray-500 h-12 focus:border-emerald-400 focus:ring-emerald-400/20"
                    placeholder="Start typing your address..."
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowManualAddress(true)}
                    className="flex items-center space-x-2 text-emerald-300 hover:text-emerald-200 text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Can't find your address? Enter manually</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="bg-gray-800/50 border-emerald-500/30 text-white placeholder-gray-500 h-12 focus:border-emerald-400 focus:ring-emerald-400/20"
                    placeholder="Enter your full address manually..."
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowManualAddress(false)}
                    className="flex items-center space-x-2 text-emerald-300 hover:text-emerald-200 text-sm transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Use address lookup instead</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-8">
              <Briefcase className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">What's your occupation?</h2>
              <p className="text-gray-400">This helps us provide relevant guidance</p>
            </div>
            <div className="space-y-2">
              <Label className="text-emerald-300">Occupation</Label>
              <select
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                className="w-full h-12 px-3 rounded-md bg-gray-800/50 border border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-emerald-400/20 focus:outline-none"
                autoFocus
              >
                <option value="">Select your occupation</option>
                {OCCUPATIONS.map((occupation) => (
                  <option key={occupation} value={occupation} className="bg-gray-800">
                    {occupation}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Calendar className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">When were you born?</h2>
              <p className="text-gray-400">This helps us comply with data protection requirements</p>
            </div>
            <div className="space-y-2">
              <Label className="text-emerald-300">Date of Birth</Label>
              <DatePicker
                value={formData.dateOfBirth}
                onChange={(value) => handleInputChange('dateOfBirth', value)}
                className="bg-gray-800/50 border-emerald-500/30 text-white placeholder-gray-500 h-12 focus:border-emerald-400 focus:ring-emerald-400/20"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-green-900/10 to-black" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2316a34a%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      
      <div className="relative flex-1 flex flex-col justify-center px-6 py-8">
        {/* Progress indicator */}
        <div className="max-w-md mx-auto w-full mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  num <= step 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {num < step ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-12 h-0.5 transition-colors ${
                    num < step ? 'bg-emerald-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            Step {step} of 3
          </p>
        </div>

        {/* Form */}
        <motion.div
          className="card-professional rounded-3xl p-8 max-w-md mx-auto w-full"
        >
          {renderStep()}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || loading}
              className={`gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 ${
                step === 1 ? 'w-full' : 'ml-auto'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <motion.div 
                    className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Setting up...</span>
                </div>
              ) : (
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span>{step === 3 ? 'Complete Setup' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
