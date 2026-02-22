import { Package, FileText, Download, Lock, Zap, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface EvidenceBundle {
  id: string;
  name: string;
  caseId: string;
  createdAt: string;
  items: number;
  size: string;
  status: 'drafting' | 'sealed' | 'delivered' | 'archived';
  chainOfCustody: boolean;
}

interface EvidenceItem {
  type: string;
  count: number;
  size: string;
  includes: string[];
}

export default function EvidencePackagingEngine() {
  const [selectedBundle, setSelectedBundle] = useState<string | null>('bundle-001');
  const [showNewBundle, setShowNewBundle] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'logs',
    'sessions',
    'diffs',
    'timeline',
    'actors'
  ]);

  const bundles: EvidenceBundle[] = [
    {
      id: 'bundle-001',
      name: 'Incident INC-2024-0847 Investigation',
      caseId: 'CASE-2024-0847',
      createdAt: '2024-03-11 14:45:00',
      items: 247,
      size: '1.2 GB',
      status: 'sealed',
      chainOfCustody: true
    },
    {
      id: 'bundle-002',
      name: 'Privilege Escalation Forensics',
      caseId: 'CASE-2024-0846',
      createdAt: '2024-03-10 09:15:00',
      items: 189,
      size: '856 MB',
      status: 'delivered',
      chainOfCustody: true
    },
    {
      id: 'bundle-003',
      name: 'Configuration Change Analysis',
      caseId: 'CASE-2024-0845',
      createdAt: '2024-03-09 16:30:00',
      items: 123,
      size: '542 MB',
      status: 'archived',
      chainOfCustody: true
    }
  ];

  const evidenceItems: EvidenceItem[] = [
    {
      type: 'Audit Logs',
      count: 8943,
      size: '347 MB',
      includes: ['System logs', 'API logs', 'Authentication logs', 'Authorization logs', 'Configuration change logs']
    },
    {
      type: 'Session Trails',
      count: 247,
      size: '156 MB',
      includes: ['Session metadata', 'Login/logout events', 'Session duration', 'Accessed resources', 'Network details']
    },
    {
      type: 'Change Diffs',
      count: 156,
      size: '89 MB',
      includes: [
        'Parameter changes (before/after)',
        'Configuration diffs',
        'Policy change impacts',
        'Timestamp of each change'
      ]
    },
    {
      type: 'Actor History',
      count: 27,
      size: '74 MB',
      includes: [
        'User profiles',
        'Permission history',
        'Role changes',
        'Location history',
        'Device information'
      ]
    },
    {
      type: 'Incident Timeline',
      count: 1,
      size: '12 MB',
      includes: ['Correlated events', 'Causal relationships', 'Impact analysis', 'Root cause analysis']
    },
    {
      type: 'Forensic Hashes',
      count: 247,
      size: '3 MB',
      includes: ['SHA-256 hashes', 'Timestamp proofs', 'Signature verification', 'Tamper detection']
    },
    {
      type: 'Chain of Custody',
      count: 1,
      size: '1 MB',
      includes: [
        'Access log',
        'Who accessed what',
        'When accessed',
        'Why accessed',
        'Cryptographic audit trail'
      ]
    },
    {
      type: 'Metadata & Context',
      count: 1,
      size: '5 MB',
      includes: ['Investigation scope', 'Case information', 'Analyst notes', 'Regulatory notes', 'Delivery manifest']
    }
  ];

  const currentBundle = bundles.find((b) => b.id === selectedBundle);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sealed':
        return 'bg-green-500/10 border-green-500/30 text-green-700';
      case 'delivered':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700';
      case 'drafting':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      case 'archived':
        return 'bg-gray-500/10 border-gray-500/30 text-gray-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sealed':
        return 'bg-green-600 text-white';
      case 'delivered':
        return 'bg-blue-600 text-white';
      case 'drafting':
        return 'bg-yellow-600 text-white';
      case 'archived':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const toggleItemSelection = (itemType: string) => {
    setSelectedItems(
      selectedItems.includes(itemType)
        ? selectedItems.filter((item) => item !== itemType)
        : [...selectedItems, itemType]
    );
  };

  const calculateBundleSize = () => {
    let size = 0;
    selectedItems.forEach((item) => {
      const evidence = evidenceItems.find((e) => e.type.toLowerCase().replace(/\s+/g, '') === item.toLowerCase().replace(/\s+/g, ''));
      if (evidence) {
        const sizeStr = evidence.size.split(' ');
        size += parseFloat(sizeStr[0]);
      }
    });
    return size > 1000 ? `${(size / 1024).toFixed(1)} GB` : `${size.toFixed(0)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Package className="w-5 h-5 text-yellow-600" />
          Evidence Packaging Engine
        </h3>
        <p className="text-sm text-muted-foreground">
          Export investigation bundles containing forensically-sound evidence packages. Includes immutable audit trails, chain-of-custody documentation, and legal discovery metadata.
        </p>
      </div>

      {/* Bundle Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Package className="w-4 h-4" />
            Evidence Bundles
          </h3>
          <button
            onClick={() => setShowNewBundle(true)}
            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-1"
          >
            <Zap className="w-4 h-4" />
            Create Bundle
          </button>
        </div>

        <div className="space-y-2">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              onClick={() => setSelectedBundle(bundle.id)}
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${selectedBundle === bundle.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{bundle.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusBadge(bundle.status)}`}>
                      {bundle.status.toUpperCase()}
                    </span>
                    {bundle.chainOfCustody && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-600 text-white flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        COC
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Case: {bundle.caseId}</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{bundle.items}</span> items
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{bundle.size}</span> total
                    </span>
                    <span className="text-muted-foreground">
                      Created: <span className="font-semibold text-foreground">{bundle.createdAt}</span>
                    </span>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-xs font-medium flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bundle Details */}
      {currentBundle && (
        <div className="space-y-6">
          {/* Bundle Composition */}
          <div className="rounded-xl border border-border/50 p-6 bg-card/50">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bundle Contents: {currentBundle.name}
            </h3>

            <div className="space-y-3">
              {evidenceItems.map((item, idx) => {
                const isSelected = selectedItems.includes(
                  item.type.toLowerCase().replace(/\s+/g, '')
                );

                return (
                  <div
                    key={idx}
                    onClick={() => toggleItemSelection(item.type.toLowerCase().replace(/\s+/g, ''))}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{item.type}</h4>
                          {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          <span className="font-semibold text-foreground">{item.count}</span> items •
                          <span className="font-semibold text-foreground ml-1">{item.size}</span>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.includes.map((include, i) => (
                            <span key={i} className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded">
                              {include}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bundle Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border/50 p-4 bg-card/50">
              <p className="text-xs text-muted-foreground mb-1">Selected Items</p>
              <p className="text-2xl font-bold text-foreground">{selectedItems.length}</p>
            </div>
            <div className="rounded-lg border border-border/50 p-4 bg-card/50">
              <p className="text-xs text-muted-foreground mb-1">Estimated Size</p>
              <p className="text-2xl font-bold text-foreground">{calculateBundleSize()}</p>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-xs text-green-700 mb-1">Chain of Custody</p>
              <p className="text-xl font-bold text-green-700 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Active
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Inclusion */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Automatic Metadata Attachment</h3>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Case Information</p>
                <p className="text-sm text-muted-foreground">Case ID, investigator, date range, scope, regulatory basis</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Chain of Custody Log</p>
                <p className="text-sm text-muted-foreground">Who accessed bundle, when, why, with cryptographic signatures on each access</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Integrity Verification</p>
                <p className="text-sm text-muted-foreground">SHA-256 hashes for all items, bundle signature, tamper-evident seals</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Legal Discovery Manifest</p>
                <p className="text-sm text-muted-foreground">Item descriptions, sensitivity labels, retention requirements, legal holds</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Analyst Notes</p>
                <p className="text-sm text-muted-foreground">Investigation findings, conclusions, recommendations, supporting analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Export & Delivery</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="px-4 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Bundle (Encrypted)
          </button>
          <button className="px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
          <button className="px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Seal Bundle (Final)
          </button>
          <button className="px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Email to Counsel
          </button>
        </div>
      </div>

      {/* Compliance Notes */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-3">Legal & Forensic Standards</h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">EDRM Compliant:</span> Bundle format follows Electronic Discovery Reference Model standards
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Forensic Integrity:</span> Hash-based verification ensures no tampering between collection and delivery
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Admissibility Ready:</span> Evidence prepared for court proceedings with complete audit trail
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Data Protection:</span> AES-256 encryption in transit and at rest with key escrow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
