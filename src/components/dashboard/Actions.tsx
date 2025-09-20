'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { analyzePrescription, AnalyzePrescriptionOutput } from '@/ai/flows/prescription-analysis';
import { identifyPill } from '@/ai/flows/pill-identification';
import { UploadCloud, ScanLine, Loader2 } from 'lucide-react';

const Actions = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { addFromPrescription, medicines } = useMedicineStore();
  const [isLoading, setIsLoading] = useState<'prescription' | 'scan' | null>(null);

  const [prescriptionResult, setPrescriptionResult] = useState<AnalyzePrescriptionOutput['medicines'] | null>(null);
  
  const prescriptionInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'prescription' | 'scan') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(type);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const dataUri = reader.result as string;
        if (type === 'prescription') {
          const result = await analyzePrescription({ prescriptionImage: dataUri });
          setPrescriptionResult(result.medicines);
        } else {
          const result = await identifyPill({ 
            photoDataUri: dataUri,
            existingMedicines: medicines.map(m => m.name),
          });

          if (result.medicineName) {
            const query = new URLSearchParams({
              name: result.medicineName,
              usage: result.usage,
              sideEffects: result.sideEffects,
              isNew: String(result.isNewMedicine),
            }).toString();
            router.push(`/medicine-info?${query}`);
          } else {
            toast({
              variant: 'destructive',
              title: 'Identification Failed',
              description: 'Could not identify the medicine from the image.',
            });
          }
        }
      } catch (error) {
        console.error(`Error during ${type} processing:`, error);
        toast({
          variant: 'destructive',
          title: 'Processing Failed',
          description: `Could not analyze the uploaded image. Please try again.`,
        });
      } finally {
        setIsLoading(null);
        // Reset file input value to allow re-uploading the same file
        if (event.target) event.target.value = '';
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'There was an issue reading your file.',
      });
      setIsLoading(null);
    };
  };

  const confirmPrescription = () => {
    if (prescriptionResult) {
      addFromPrescription(prescriptionResult);
      toast({
        title: 'Prescription Added',
        description: 'New medicines have been added to your inventory.',
      });
      setPrescriptionResult(null);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <input
            type="file"
            accept="image/*"
            ref={prescriptionInputRef}
            onChange={(e) => handleFileChange(e, 'prescription')}
            className="hidden"
          />
          <Button 
            size="lg" 
            className="w-full text-base"
            onClick={() => prescriptionInputRef.current?.click()}
            disabled={!!isLoading}
          >
            {isLoading === 'prescription' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UploadCloud />
            )}
            <span>Upload Prescription</span>
          </Button>

          <input
            type="file"
            accept="image/*"
            ref={scanInputRef}
            onChange={(e) => handleFileChange(e, 'scan')}
            className="hidden"
          />
          <Button 
            size="lg" 
            variant="secondary" 
            className="w-full text-base"
            onClick={() => scanInputRef.current?.click()}
            disabled={!!isLoading}
          >
            {isLoading === 'scan' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ScanLine />
            )}
            <span>Scan Pill Package</span>
          </Button>
        </CardContent>
      </Card>

      {/* Prescription Result Dialog */}
      <Dialog open={!!prescriptionResult} onOpenChange={() => setPrescriptionResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prescription Analysis</DialogTitle>
            <DialogDescription>
              We found the following medicines in your prescription. Confirm to add them to your list.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto p-1">
            <ul className="space-y-2">
              {prescriptionResult?.map((med, index) => (
                <li key={index} className="p-2 bg-secondary rounded-md text-sm">
                  <p className="font-semibold">{med.name}</p>
                  <p className="text-muted-foreground">{med.dosage} - {med.timing}</p>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmPrescription}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Actions;
