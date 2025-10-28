import type { Meta } from '@storybook/react';
import { colors, typography, spacing, shadows, gradients } from '@/shared/constants/design-tokens';

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

/**
 * Color Palette
 */
export const Colors = () => (
  <div className="p-8 space-y-12">
    <div>
      <h1 className="text-4xl font-bold mb-2">Color Palette</h1>
      <p className="text-muted-foreground mb-8">
        Canlı ve enerji dolu renk paleti. Tüm renkler 50-950 arası tonlarda mevcuttur.
      </p>
    </div>

    {Object.entries(colors).map(([colorName, shades]) => (
      <div key={colorName} className="space-y-4">
        <h2 className="text-2xl font-semibold capitalize">{colorName}</h2>
        <div className="grid grid-cols-11 gap-2">
          {Object.entries(shades).map(([shade, color]) => (
            <div key={shade} className="space-y-2">
              <div
                className="h-20 rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer"
                style={{ backgroundColor: color }}
                title={`${colorName}-${shade}: ${color}`}
              />
              <div className="text-center">
                <p className="text-sm font-medium">{shade}</p>
                <p className="text-xs text-muted-foreground font-mono">{color}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Typography Scale
 */
export const Typography = () => (
  <div className="p-8 space-y-8">
    <div>
      <h1 className="text-4xl font-bold mb-2">Typography</h1>
      <p className="text-muted-foreground mb-8">
        Font boyutları, ağırlıkları ve satır yükseklikleri.
      </p>
    </div>

    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Font Sizes</h2>
      {Object.entries(typography.fontSize).map(([name, size]) => (
        <div key={name} className="flex items-baseline gap-4 border-b pb-4">
          <div className="w-24 text-sm text-muted-foreground font-mono">{name}</div>
          <div className="w-24 text-sm text-muted-foreground">{size}</div>
          <div style={{ fontSize: size }} className="font-medium flex-1">
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      ))}
    </div>

    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Font Weights</h2>
      {Object.entries(typography.fontWeight).map(([name, weight]) => (
        <div key={name} className="flex items-center gap-4 border-b pb-4">
          <div className="w-24 text-sm text-muted-foreground font-mono">{name}</div>
          <div className="w-24 text-sm text-muted-foreground">{weight}</div>
          <div style={{ fontWeight: weight }} className="text-lg flex-1">
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Spacing Scale
 */
export const Spacing = () => (
  <div className="p-8 space-y-8">
    <div>
      <h1 className="text-4xl font-bold mb-2">Spacing</h1>
      <p className="text-muted-foreground mb-8">
        8px grid sistemi. Tüm spacing değerleri 8'in katlarıdır.
      </p>
    </div>

    <div className="space-y-4">
      {Object.entries(spacing).map(([name, size]) => (
        <div key={name} className="flex items-center gap-4">
          <div className="w-16 text-sm font-mono text-muted-foreground">{name}</div>
          <div className="w-24 text-sm text-muted-foreground">{size}</div>
          <div className="flex items-center gap-2">
            <div
              className="bg-primary rounded"
              style={{ width: size, height: '2rem' }}
            />
            <span className="text-xs text-muted-foreground">({size})</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Shadows
 */
export const Shadows = () => (
  <div className="p-8 space-y-8">
    <div>
      <h1 className="text-4xl font-bold mb-2">Shadows</h1>
      <p className="text-muted-foreground mb-8">
        Gölge efektleri. Derinlik ve hiyerarşi oluşturmak için kullanılır.
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {Object.entries(shadows).map(([name, shadow]) => (
        <div key={name} className="space-y-4">
          <div
            className="h-32 bg-card rounded-lg flex items-center justify-center"
            style={{ boxShadow: shadow }}
          >
            <span className="font-medium">{name}</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono break-all">{shadow}</p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Gradients
 */
export const Gradients = () => (
  <div className="p-8 space-y-8">
    <div>
      <h1 className="text-4xl font-bold mb-2">Gradients</h1>
      <p className="text-muted-foreground mb-8">
        Canlı gradient'ler. Özel vurgular ve hero bölümler için kullanılır.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {Object.entries(gradients).map(([name, gradient]) => (
        <div key={name} className="space-y-4">
          <div
            className="h-32 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ background: gradient }}
          >
            {name}
          </div>
          <p className="text-xs text-muted-foreground font-mono break-all">{gradient}</p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * All Tokens Overview
 */
export const Overview = () => (
  <div className="p-8 space-y-12">
    <div>
      <h1 className="text-4xl font-bold mb-2">Design Tokens Overview</h1>
      <p className="text-muted-foreground mb-8">
        Akademi Port tasarım sisteminin tüm token'larına genel bakış.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-6 border rounded-lg space-y-2">
        <h3 className="text-lg font-semibold">Colors</h3>
        <p className="text-sm text-muted-foreground">
          8 renk ailesi, her biri 11 tonla
        </p>
        <p className="text-2xl font-bold text-primary">88 renk</p>
      </div>

      <div className="p-6 border rounded-lg space-y-2">
        <h3 className="text-lg font-semibold">Typography</h3>
        <p className="text-sm text-muted-foreground">
          Font boyutları, ağırlıkları ve aileler
        </p>
        <p className="text-2xl font-bold text-secondary">11 boyut</p>
      </div>

      <div className="p-6 border rounded-lg space-y-2">
        <h3 className="text-lg font-semibold">Spacing</h3>
        <p className="text-sm text-muted-foreground">
          8px grid sistemi
        </p>
        <p className="text-2xl font-bold text-accent">32 değer</p>
      </div>

      <div className="p-6 border rounded-lg space-y-2">
        <h3 className="text-lg font-semibold">Shadows</h3>
        <p className="text-sm text-muted-foreground">
          Derinlik ve hiyerarşi
        </p>
        <p className="text-2xl font-bold text-success">8 seviye</p>
      </div>

      <div className="p-6 border rounded-lg space-y-2">
        <h3 className="text-lg font-semibold">Gradients</h3>
        <p className="text-sm text-muted-foreground">
          Canlı gradient efektleri
        </p>
        <p className="text-2xl font-bold text-info">7 gradient</p>
      </div>

      <div className="p-6 border rounded-lg space-y-2">
        <h3 className="text-lg font-semibold">Border Radius</h3>
        <p className="text-sm text-muted-foreground">
          Köşe yuvarlaklıkları
        </p>
        <p className="text-2xl font-bold text-warning">9 değer</p>
      </div>
    </div>

    <div className="p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Kullanım</h3>
      <pre className="bg-card p-4 rounded text-sm overflow-x-auto">
        <code>{`import { colors, typography, spacing } from '@/shared/constants/design-tokens';

// Renk kullanımı
const primaryColor = colors.primary[500];

// Typography kullanımı
const fontSize = typography.fontSize.lg;

// Spacing kullanımı
const padding = spacing[4];`}</code>
      </pre>
    </div>
  </div>
);

