
import { Flex } from '@mantine/core'

function MainLayout({ children }: { children: React.ReactElement }) {
    return (
        <Flex>
            <Flex>{children}</Flex>
        </Flex>
    )
}

export default MainLayout