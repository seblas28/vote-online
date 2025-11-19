// Local storage data management for the electoral platform

export interface Candidate {
  id: string;
  name: string;
  party: string;
  proposals: string;
  imageUrl: string;
  category: 'president' | 'mayor' | 'deputy';
}

export interface Vote {
  id: string;
  timestamp: Date;
  president: string;
  mayor: string;
  deputy: string;
}

export interface VotingStatus {
  isActive: boolean;
  isFinished: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

const STORAGE_KEYS = {
  CANDIDATES: 'electoral_candidates',
  VOTES: 'electoral_votes',
  STATUS: 'electoral_status',
};

// Initialize default candidates
const defaultCandidates: Candidate[] = [
  {
    id: "p1",
    name: "María González",
    party: "Partido del Progreso",
    proposals: "Enfoque en educación universal gratuita, reforma del sistema de salud y creación de empleos en tecnología verde.",
    imageUrl: "/placeholder.svg",
    category: 'president',
  },
  {
    id: "p2",
    name: "Carlos Ramírez",
    party: "Alianza Nacional",
    proposals: "Reducción de impuestos para pequeñas empresas, fortalecimiento de la seguridad ciudadana y apoyo al sector agrícola.",
    imageUrl: "/placeholder.svg",
    category: 'president',
  },
  {
    id: "m1",
    name: "Ana Martínez",
    party: "Movimiento Ciudadano",
    proposals: "Mejora del transporte público, construcción de parques comunitarios y programa de vivienda accesible.",
    imageUrl: "/placeholder.svg",
    category: 'mayor',
  },
  {
    id: "m2",
    name: "José López",
    party: "Partido Verde Local",
    proposals: "Reciclaje obligatorio, incentivos para energía solar y expansión de ciclovías en toda la ciudad.",
    imageUrl: "/placeholder.svg",
    category: 'mayor',
  },
  {
    id: "d1",
    name: "Laura Fernández",
    party: "Partido Progresista",
    proposals: "Leyes de protección al consumidor, transparencia gubernamental y derechos laborales modernos.",
    imageUrl: "/placeholder.svg",
    category: 'deputy',
  },
  {
    id: "d2",
    name: "Roberto Silva",
    party: "Unión Democrática",
    proposals: "Apoyo a la agricultura familiar, reforma educativa y mejora de infraestructura rural.",
    imageUrl: "/placeholder.svg",
    category: 'deputy',
  },
];

export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const dataStore = {
  // Candidates
  getCandidates(): Candidate[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    if (!stored) {
      this.setCandidates(defaultCandidates);
      return defaultCandidates;
    }
    return JSON.parse(stored);
  },

  setCandidates(candidates: Candidate[]) {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  },

  addCandidate(candidate: Omit<Candidate, 'id'>) {
    const candidates = this.getCandidates();
    const newCandidate = {
      ...candidate,
      id: `${candidate.category[0]}${Date.now()}`,
    };
    candidates.push(newCandidate);
    this.setCandidates(candidates);
    return newCandidate;
  },

  updateCandidate(id: string, updates: Partial<Candidate>) {
    const candidates = this.getCandidates();
    const index = candidates.findIndex(c => c.id === id);
    if (index !== -1) {
      candidates[index] = { ...candidates[index], ...updates };
      this.setCandidates(candidates);
      return candidates[index];
    }
    return null;
  },

  deleteCandidate(id: string) {
    const candidates = this.getCandidates();
    const filtered = candidates.filter(c => c.id !== id);
    this.setCandidates(filtered);
  },

  // Votes
  getVotes(): Vote[] {
    const stored = localStorage.getItem(STORAGE_KEYS.VOTES);
    if (!stored) return [];
    return JSON.parse(stored).map((v: any) => ({
      ...v,
      timestamp: new Date(v.timestamp),
    }));
  },

  setVotes(votes: Vote[]) {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
  },

  addVote(vote: Omit<Vote, 'id' | 'timestamp'>) {
    const votes = this.getVotes();
    const newVote: Vote = {
      ...vote,
      id: `v${Date.now()}`,
      timestamp: new Date(),
    };
    votes.push(newVote);
    this.setVotes(votes);
    return newVote;
  },

  getVoteStats() {
    const votes = this.getVotes();
    const candidates = this.getCandidates();
    
    const stats = {
      president: {} as Record<string, number>,
      mayor: {} as Record<string, number>,
      deputy: {} as Record<string, number>,
    };

    // Initialize counts including null votes
    candidates.forEach(c => {
      stats[c.category][c.id] = 0;
    });
    
    // Add null vote categories
    stats.president['null'] = 0;
    stats.mayor['null'] = 0;
    stats.deputy['null'] = 0;

    // Count votes
    votes.forEach(vote => {
      // President votes
      if (vote.president === 'null' || !vote.president) {
        stats.president['null']++;
      } else if (stats.president[vote.president] !== undefined) {
        stats.president[vote.president]++;
      }
      
      // Mayor votes
      if (vote.mayor === 'null' || !vote.mayor) {
        stats.mayor['null']++;
      } else if (stats.mayor[vote.mayor] !== undefined) {
        stats.mayor[vote.mayor]++;
      }
      
      // Deputy votes
      if (vote.deputy === 'null' || !vote.deputy) {
        stats.deputy['null']++;
      } else if (stats.deputy[vote.deputy] !== undefined) {
        stats.deputy[vote.deputy]++;
      }
    });

    return stats;
  },

  getVotingStatus(): VotingStatus {
    const stored = localStorage.getItem(STORAGE_KEYS.STATUS);
    if (!stored) {
      return {
        isActive: false,
        isFinished: false,
        startTime: null,
        endTime: null
      };
    }
    return JSON.parse(stored);
  },

  startVoting() {
    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 horas
    
    const status: VotingStatus = {
      isActive: true,
      isFinished: false,
      startTime: now.toISOString(),
      endTime: endTime.toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(status));
    return status;
  },

  endVoting() {
    const currentStatus = this.getVotingStatus();
    const status: VotingStatus = {
      ...currentStatus,
      isActive: false,
      isFinished: true,
      endTime: new Date().toISOString() // Marca el fin real ahora mismo
    };
    localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(status));
    return status;
  },

  resetVoting() {
    localStorage.removeItem(STORAGE_KEYS.STATUS);
    localStorage.removeItem(STORAGE_KEYS.VOTES); // Opcional: limpiar votos al reiniciar
  },

  importVotesFromCSV(csvData: string) {
    const lines = csvData.split('\n').filter(line => line.trim());
    const votes = this.getVotes();
    
    let imported = 0;
    let nullVotes = 0;
    let invalidRows = 0;
    
    const candidates = this.getCandidates();
    const validIds = new Set(candidates.map(c => c.id));
    
    lines.forEach((line, index) => {
      if (index === 0) return; // Skip header
      
      const [president, mayor, deputy] = line.split(',').map(s => s.trim());
      
      if (!president && !mayor && !deputy) {
        invalidRows++;
        return;
      }
      
      const cleanPresident = (!president || president === '' || !validIds.has(president)) ? 'null' : president;
      const cleanMayor = (!mayor || mayor === '' || !validIds.has(mayor)) ? 'null' : mayor;
      const cleanDeputy = (!deputy || deputy === '' || !validIds.has(deputy)) ? 'null' : deputy;
      
      if (cleanPresident === 'null' || cleanMayor === 'null' || cleanDeputy === 'null') {
        nullVotes++;
      }
      
      votes.push({
        id: `csv${Date.now()}${index}`,
        timestamp: new Date(),
        president: cleanPresident,
        mayor: cleanMayor,
        deputy: cleanDeputy,
      });
      imported++;
    });

    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
    return { imported, nullVotes, invalidRows };
  },

  revalidateAndCleanVotes(): number {
    const votes = this.getVotes();
    const candidates = this.getCandidates();
    const validIds = new Set(candidates.map(c => c.id));

    let cleanedCount = 0;

    const updatedVotes = votes.map(vote => {
      let isCleaned = false;
      const updateVote = { ...vote };

      if(updateVote.president && updateVote.president !== 'null' && !validIds.has(updateVote.president)) {
        updateVote.president = 'null';
        isCleaned = true;
      }
      if(updateVote.mayor && updateVote.mayor !== 'null' && !validIds.has(updateVote.mayor)) {
        updateVote.mayor = 'null';
        isCleaned = true;
      }
      if(updateVote.deputy && updateVote.deputy !== 'null' && !validIds.has(updateVote.deputy)) {
        updateVote.deputy = 'null';
        isCleaned = true;
      }

      if (isCleaned) cleanedCount++;
      return updateVote;
    });

    this.setVotes(updatedVotes);
    return cleanedCount;

  },

  getWinners() {
    const stats = this.getVoteStats();
    const candidates = this.getCandidates();
    
    const getCategoryWinner = (category: 'president' | 'mayor' | 'deputy') => {
      const catStats = stats[category];
      let maxVotes = -1;
      let winnerId = null;

      Object.entries(catStats).forEach(([id, votes]) => {
        if (id !== 'null' && (votes as number) > maxVotes) {
          maxVotes = votes as number;
          winnerId = id;
        }
      });

      if (!winnerId) return null;
      const winner = candidates.find(c => c.id === winnerId);
      return winner ? { ...winner, votes: maxVotes } : null;
    };

    return {
      president: getCategoryWinner('president'),
      mayor: getCategoryWinner('mayor'),
      deputy: getCategoryWinner('deputy'),
    };
  }

  
};
