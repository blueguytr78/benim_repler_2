import React, { useState } from 'react';
import { PageContent, Navbar } from 'components/elements/Layouts';
import { GovernCard } from 'components/resources/Govern';
import TabMenuWrapper from 'components/elements/TabMenu/TabMenuWrapper';
import TabMenu from 'components/elements/TabMenu/TabMenu';
import TabContentItemWrapper from 'components/elements/TabMenu/TabContentItemWrapper';

const TABS = {
  Open: 'open',
  Closed: 'closed',
};

const GovernPage = () => {
  const [selectedTabIdx, setSelectedTabIdx] = useState(TABS.Open);

  return (
    <PageContent className="lg:justify-start">
      <Navbar />
      <div className="flex h-full justify-center pt-20 lg:pt-12 pb-4">
        <div className="w-full lg:w-5/6 bg-secondary p-4 sm:p-10 rounded-lg">
          <div className="pb-6 flex flex-col sm:flex-row justify-between sm:items-center">
            <h1 className="text-3xl pb-5 sm:pb-0 font-semibold text-accent">Govern</h1>
            <TabMenuWrapper className="sm:w-80">
              <TabMenu
                label="Open"
                onClick={() => setSelectedTabIdx(TABS.Open)}
                active={selectedTabIdx === TABS.Open}
                className="rounded-l-lg"
              />
              <TabMenu
                label="Closed"
                onClick={() => setSelectedTabIdx(TABS.Closed)}
                active={selectedTabIdx === TABS.Closed}
                className="rounded-r-lg"
              />
            </TabMenuWrapper>
          </div>
          <TabContentItemWrapper tabIndex={TABS.Open} currentTabIndex={selectedTabIdx}>
            <GovernCard className="mb-4" />
            <GovernCard className="mb-4" />
            <GovernCard />
          </TabContentItemWrapper>
          <TabContentItemWrapper tabIndex={TABS.Closed} currentTabIndex={selectedTabIdx}>
            <GovernCard className="mb-4" />
          </TabContentItemWrapper>
        </div>
      </div>
    </PageContent>
  );
};

export default GovernPage;
