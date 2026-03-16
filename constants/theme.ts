export const Theme = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  radius: { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 },
  fontSize: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, title: 28 },
  fontWeight: { regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const },
  containerTypeConfig: {
    carton: { icon: 'cube-outline', label: 'Carton' },
    sac: { icon: 'bag-outline', label: 'Sac' },
    valise: { icon: 'briefcase-outline', label: 'Valise' },
    boite: { icon: 'archive-outline', label: 'Boîte' },
    dossier: { icon: 'folder-outline', label: 'Dossier' },
    sachet: { icon: 'pricetag-outline', label: 'Sachet' },
  },
  statusConfig: {
    emballe: { icon: 'cube', label: 'Emballé', color: '#1D4ED8' },
    camion: { icon: 'car', label: 'Camion', color: '#92400E' },
    depose: { icon: 'home', label: 'Déposé', color: '#166534' },
    deballe: { icon: 'checkmark-circle', label: 'Déballé', color: '#475569' },
  },
  priorityConfig: {
    urgent: { label: 'Urgent', color: '#991B1B' },
    semaine: { label: 'Cette semaine', color: '#92400E' },
    pas_presse: { label: 'Pas pressé', color: '#166534' },
  },
};
