import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_LOGO_SRC = '/open-valley-logo.png';

type LogoStage = 'tenant' | 'default' | 'text';

interface BrandLogoProps {
  tenantLogoSrc?: string | null;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  alt?: string;
}

export default function BrandLogo({
  tenantLogoSrc,
  className,
  imageClassName,
  textClassName,
  alt = 'Open Valley Logo',
}: BrandLogoProps) {
  const [stage, setStage] = useState<LogoStage>(tenantLogoSrc ? 'tenant' : 'default');

  const resolvedSrc = useMemo(() => {
    if (stage === 'tenant' && tenantLogoSrc) {
      return tenantLogoSrc;
    }

    if (stage === 'default') {
      return DEFAULT_LOGO_SRC;
    }

    return null;
  }, [stage, tenantLogoSrc]);

  const handleImageError = () => {
    if (stage === 'tenant') {
      setStage('default');
      return;
    }

    setStage('text');
  };

  if (!resolvedSrc || stage === 'text') {
    return (
      <div className={cn('font-semibold tracking-wide text-foreground', className, textClassName)}>
        Open Valley
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={cn(className, imageClassName)}
      onError={handleImageError}
      loading="eager"
      decoding="async"
    />
  );
}

export { DEFAULT_LOGO_SRC };
