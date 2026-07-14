import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { InvoiceStorage } from '@/lib/invoiceStorage';
import { useToast } from '@/hooks/use-toast';

interface InvoiceListProps {
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  refresh: number;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ onEdit, onView, refresh }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadInvoices();
  }, [refresh]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchInvoices();
    } else {
      setFilteredInvoices(invoices);
    }
  }, [searchQuery, invoices]);

  const loadInvoices = async () => {
    try {
      const allInvoices = await InvoiceStorage.getAll();
      // Sort by invoice number descending (newest first)
      allInvoices.sort((a, b) => b.invoiceNo - a.invoiceNo);
      setInvoices(allInvoices);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    }
  };

  const searchInvoices = async () => {
    try {
      const filtered = await InvoiceStorage.search(searchQuery);
      setFilteredInvoices(filtered);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search invoices",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete Invoice #${invoice.invoiceNo}?`)) {
      try {
        const success = await InvoiceStorage.delete(invoice.id);
        if (success) {
          loadInvoices();
          toast({
            title: "Success",
            description: "Invoice deleted successfully",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete invoice",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete invoice",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-blue">Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by customer name, invoice number, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No invoices found matching your search.' : 'No invoices created yet.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="border border-invoice-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-invoice-text">
                            Invoice #{invoice.invoiceNo}
                          </h3>
                          <Badge variant="secondary" className="bg-invoice-blue-light text-invoice-blue">
                            {invoice.terms}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p className="font-medium text-invoice-text">{invoice.customerName}</p>
                            <p>{invoice.customerCity}</p>
                          </div>
                          <div>
                            <p>Date: {formatDate(invoice.date)}</p>
                            <p>Items: {invoice.items.length}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-invoice-text">
                              Total: {formatCurrency(invoice.totalAmount)}
                            </p>
                            <p>Created: {formatDate(invoice.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(invoice)}
                          className="border-invoice-blue text-invoice-blue hover:bg-invoice-blue-light"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(invoice)}
                          className="border-invoice-blue text-invoice-blue hover:bg-invoice-blue-light"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(invoice)}
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};