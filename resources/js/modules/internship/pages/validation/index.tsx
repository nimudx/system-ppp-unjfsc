import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { User, ChevronRight, Building2, Loader2 } from 'lucide-react';
import type { Faculty } from '@/modules/academic';
import { DetailHeader } from '@/modules/documents';

import type { InternshipAssignment } from '@/modules/internship/types';
import { AcademicFilter } from '@/shared/components/data-table/academic-filter';
import AcademicPagination from '@/shared/components/data-table/academic-pagination';
import AcademicSearch from '@/shared/components/data-table/academic-search';
import Heading from '@/shared/components/heading';
import { Badge } from '@/shared/components/ui/badge';