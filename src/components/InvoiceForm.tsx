import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { InvoiceFormData, InvoiceItem } from '@/types/invoice';
import { InvoiceStorage } from '@/lib/invoiceStorage';
import { useToast } from '@/hooks/use-toast';

interface InvoiceFormProps {
  onSubmit: () => void;
  initialData?: InvoiceFormData;
  editId?: string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, initialData, editId }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InvoiceFormData>(
    initialData || {
      date: new Date().toISOString().split('T')[0],
      terms: 'COD',
      customerName: '',
      customerAddress: '',
      customerCity: '',
      customerPhone: '',
      items: [{ stockId: '', description: '', pieces: 0, weight: 0, pricePerUnit: 0 }],
      shippingCharges: 0,
      otherCharges: 0,
      advancePayment: 0
    }
  );

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { stockId: '', description: '', pieces: 0, weight: 0, pricePerUnit: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: keyof Omit<InvoiceItem, 'id' | 'total'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateItemTotal = (pieces: number, pricePerUnit: number) => {
    return pieces * pricePerUnit;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + calculateItemTotal(item.pieces, item.pricePerUnit), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + formData.shippingCharges + formData.otherCharges;
  };

  const calculateBalanceDue = () => {
    return calculateTotal() - (formData.advancePayment || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editId) {
        await InvoiceStorage.update(editId, formData);
        toast({
          title: "Success",
          description: "Invoice updated successfully",
        });
      } else {
        await InvoiceStorage.create(formData);
        toast({
          title: "Success",
          description: "Invoice created successfully",
        });
      }
      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-blue">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms</Label>
              <Input
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                placeholder="Enter payment terms (e.g., COD, Net 30)"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-blue">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="customerAddress">Address</Label>
            <Textarea
              id="customerAddress"
              value={formData.customerAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="customerCity">City</Label>
            <Input
              id="customerCity"
              value={formData.customerCity}
              onChange={(e) => setFormData(prev => ({ ...prev, customerCity: e.target.value }))}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-blue flex items-center justify-between">
            Items
            <Button type="button" onClick={addItem} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border border-invoice-border rounded-lg">
                <div>
                  <Label>Stock ID</Label>
                  <Input
                    value={item.stockId}
                    onChange={(e) => updateItem(index, 'stockId', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Pieces</Label>
                  <Input
                    type="number"
                    value={item.pieces}
                    onChange={(e) => updateItem(index, 'pieces', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Label>Weight (CT)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.weight}
                    onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Label>Price/Unit ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.pricePerUnit}
                    onChange={(e) => updateItem(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>Total ($)</Label>
                    <Input
                      value={calculateItemTotal(item.pieces, item.pricePerUnit).toFixed(2)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-blue">Charges & Total</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Subtotal ($)</Label>
              <Input
                value={calculateSubtotal().toFixed(2)}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="shippingCharges">Shipping Charges ($)</Label>
              <Input
                id="shippingCharges"
                type="number"
                step="0.01"
                value={formData.shippingCharges}
                onChange={(e) => setFormData(prev => ({ ...prev, shippingCharges: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="otherCharges">Sales Tax ($)</Label>
              <Input
                id="otherCharges"
                type="number"
                step="0.01"
                value={formData.otherCharges}
                onChange={(e) => setFormData(prev => ({ ...prev, otherCharges: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="advancePayment">Deposit Payment ($)</Label>
              <Input
                id="advancePayment"
                type="number"
                step="0.01"
                min="0"
                value={formData.advancePayment}
                onChange={(e) => setFormData(prev => ({ ...prev, advancePayment: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-invoice-border space-y-1">
            <div className="text-right">
              <Label className="text-lg font-semibold">Total Amount: ${calculateTotal().toFixed(2)}</Label>
            </div>
            {(formData.advancePayment || 0) > 0 && (
              <>
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">Advance Paid: ${(formData.advancePayment || 0).toFixed(2)}</Label>
                </div>
                <div className="text-right">
                  <Label className="text-lg font-semibold text-invoice-blue">Balance Due: ${calculateBalanceDue().toFixed(2)}</Label>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" className="bg-invoice-blue hover:bg-invoice-blue/90">
          {editId ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
};