import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, List, LogOut, QrCode } from 'lucide-react';
import { InvoiceForm } from '@/components/InvoiceForm';
import { InvoiceList } from '@/components/InvoiceList';
import { InvoicePreview } from '@/components/InvoicePreview';
import { PaymentQRSettings } from '@/components/PaymentQRSettings';
import { Invoice, InvoiceFormData } from '@/types/invoice';
import { logout } from '@/lib/auth';

export const BillingSystem: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setEditingInvoice(null);
    setViewingInvoice(null);
    setActiveTab('create');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setViewingInvoice(null);
    setActiveTab('create');
  };

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setEditingInvoice(null);
    setActiveTab('preview');
  };

  const handleFormSubmit = () => {
    setEditingInvoice(null);
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  const getInitialFormData = (): InvoiceFormData | undefined => {
    if (!editingInvoice) return undefined;
    
    return {
      date: editingInvoice.date,
      terms: editingInvoice.terms,
      customerName: editingInvoice.customerName,
      customerAddress: editingInvoice.customerAddress,
      customerCity: editingInvoice.customerCity,
      customerPhone: editingInvoice.customerPhone,
      items: editingInvoice.items.map(item => ({
        stockId: item.stockId,
        description: item.description,
        pieces: item.pieces,
        weight: item.weight,
        pricePerUnit: item.pricePerUnit
      })),
      shippingCharges: editingInvoice.shippingCharges,
      otherCharges: editingInvoice.otherCharges,
      advancePayment: editingInvoice.advancePayment
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/9458b363-f879-4ae4-82ed-e8d12ded6ee3.png" 
                alt="Starlink Jewels Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-invoice-blue">Starlink Jewels</h1>
                <p className="text-muted-foreground">Billing Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateNew}
                className="bg-invoice-blue hover:bg-invoice-blue/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-invoice-blue text-invoice-blue hover:bg-invoice-blue-light"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Payment QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <InvoiceList 
              onEdit={handleEdit}
              onView={handleView}
              refresh={refreshTrigger}
            />
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="text-invoice-blue">
                  {editingInvoice ? `Edit Invoice #${editingInvoice.invoiceNo}` : 'Create New Invoice'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceForm 
                  onSubmit={handleFormSubmit}
                  initialData={getInitialFormData()}
                  editId={editingInvoice?.id}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <PaymentQRSettings />
          </TabsContent>

          <TabsContent value="preview">
            {viewingInvoice ? (
              <InvoicePreview invoice={viewingInvoice} />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>No invoice selected for preview.</p>
                    <p>Please select an invoice from the list to view.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};