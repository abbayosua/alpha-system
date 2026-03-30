'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileSearch, User, Calendar, Eye } from 'lucide-react';

const auditLogs = [
  {
    id: '1',
    user: 'Admin',
    action: 'CREATE',
    entityType: 'User',
    entityId: 'USR001',
    oldValue: null,
    newValue: '{ "name": "Ahmad Subekti", "email": "ahmad@email.com" }',
    ipAddress: '192.168.1.1',
    createdAt: '2024-02-14 10:30:00',
  },
  {
    id: '2',
    user: 'Admin',
    action: 'UPDATE',
    entityType: 'TPSAssignment',
    entityId: 'ASN001',
    oldValue: '{ "status": "PENDING" }',
    newValue: '{ "status": "ACTIVE" }',
    ipAddress: '192.168.1.1',
    createdAt: '2024-02-14 11:00:00',
  },
  {
    id: '3',
    user: 'Ahmad Subekti',
    action: 'CREATE',
    entityType: 'CheckIn',
    entityId: 'CHK001',
    oldValue: null,
    newValue: '{ "type": "MORNING", "gpsVerified": true }',
    ipAddress: '192.168.1.100',
    createdAt: '2024-02-14 07:30:00',
  },
  {
    id: '4',
    user: 'Admin Keuangan',
    action: 'UPDATE',
    entityType: 'Payment',
    entityId: 'PAY001',
    oldValue: '{ "status": "PENDING" }',
    newValue: '{ "status": "APPROVED" }',
    ipAddress: '192.168.1.2',
    createdAt: '2024-02-14 15:00:00',
  },
  {
    id: '5',
    user: 'Siti Rahayu',
    action: 'CREATE',
    entityType: 'FraudReport',
    entityId: 'RPT001',
    oldValue: null,
    newValue: '{ "title": "Kotak suara tidak disegel" }',
    ipAddress: '192.168.1.101',
    createdAt: '2024-02-14 08:30:00',
  },
];

const actionColors: Record<string, string> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
};

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Audit Trail"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Audit' }]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Log Aktivitas Sistem
          </CardTitle>
          <CardDescription>Riwayat semua aktivitas dalam sistem</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Entitas</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">{log.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {log.user}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={actionColors[log.action] as any}>
                      {log.action}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.entityType}</p>
                      <p className="text-xs text-muted-foreground">{log.entityId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                  <TableCell>
                    <Eye className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
