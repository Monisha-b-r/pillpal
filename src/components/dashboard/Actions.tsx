'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { analyzePrescription, PrescriptionAnalysisOutput } from '@/ai/flows/prescription-analysis';
import { identifyPill } from '@/ai/flows/pill-identification';
import { UploadCloud, ScanLine, Loader2 } from 'lucide-react';

const Actions = () => {
  const { toast } = useToast();
  const { addFromPrescription, addStock, medicines } = useMedicineStore();
  const [isLoading, setIsLoading] = useState<'prescription' | 'scan' | null>(null);

  const [prescriptionResult, setPrescriptionResult] = useState<PrescriptionAnalysisOutput['medicines'] | null>(null);
  const [scanResult, setScanResult] = useState<{ medicineName: string; isNewMedicine: boolean } | null>(null);
  const [stockAmount, setStockAmount] = useState<number>(30);
  
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
          setScanResult(result);
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

  const confirmScan = () => {
    if (scanResult) {
      const success = addStock(scanResult.medicineName, stockAmount);
      if (success) {
        toast({
          title: 'Inventory Updated',
          description: `${stockAmount} units of ${scanResult.medicineName} added.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: `Could not find ${scanResult.medicineName} in your inventory. Add it from a prescription first.`,
        });
      }
      setScanResult(null);
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
      
      {/* Scan Result Dialog */}
      <Dialog open={!!scanResult} onOpenChange={() => setScanResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pill Identification</DialogTitle>
            <DialogDescription>
              {scanResult?.isNewMedicine && <p className="text-destructive font-semibold mb-2">This appears to be a new medicine.</p>}
              We identified this medicine. How many units would you like to add to your inventory?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-bold text-lg text-center p-4 bg-secondary rounded-md">{scanResult?.medicineName}</p>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="stock-amount" className="text-right">Quantity</Label>
              <Input
                id="stock-amount"
                type="number"
                value={stockAmount}
                onChange={(e) => setStockAmount(parseInt(e.target.value, 10) || 0)}
                className="col-span-2"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmScan}>Add to Inventory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Actions;
