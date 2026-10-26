import { HStack, Link, SimpleGrid } from '@chakra-ui/react'
import { BookOpen, Layout, Terminal } from 'lucide-react'
import { InfoCard } from '@/shared/components/info-card'
import { CommandSnippet } from '@/shared/components/command-snippet'
import { API_DOCS_URL } from '@/shared/utils/api-url'

export function FeatureGrid() {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap="4" maxW="5xl" mx="auto" w="full">
      <InfoCard
        icon={<Terminal />}
        title="CLI"
        description="Start the backend and frontend together with one command."
      >
        <CommandSnippet command="blacksmith dev" />
      </InfoCard>

      <InfoCard
        icon={<BookOpen />}
        title="API"
        description="Every endpoint is documented and typed from the OpenAPI schema."
      >
        <HStack gap="4" textStyle="sm">
          <Link href={API_DOCS_URL} target="_blank" rel="noopener noreferrer" variant="underline">
            Swagger UI
          </Link>
        </HStack>
      </InfoCard>

      <InfoCard
        icon={<Layout />}
        title="Frontend"
        description="React, TanStack Query and Chakra UI, with typed API hooks."
      >
        <CommandSnippet command="blacksmith make:resource Post" />
      </InfoCard>
    </SimpleGrid>
  )
}
