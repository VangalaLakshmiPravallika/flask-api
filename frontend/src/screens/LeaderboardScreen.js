import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Spin, Typography, Card, Tag } from 'antd';
import { CrownOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title } = Typography;

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { challengeName } = useParams();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-leaderboard/${encodeURIComponent(challengeName)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [challengeName]);

  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render: (_, __, index) => (
        <span style={{ fontWeight: 'bold' }}>
          {index + 1 <= 3 ? (
            <Tag icon={<CrownOutlined />} color={index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}>
              {index + 1}
            </Tag>
          ) : index + 1}
        </span>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (username, _, index) => (
        <span style={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
          {username}
        </span>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => `${progress}%`,
      sorter: (a, b) => a.progress - b.progress,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Card
        title={
          <Title level={3} style={{ margin: 0 }}>
            <TrophyOutlined style={{ marginRight: '8px' }} />
            {challengeName} Leaderboard
          </Title>
        }
        bordered={false}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Spin size="large" />
          </div>
        ) : leaderboard.length > 0 ? (
          <Table
            columns={columns}
            dataSource={leaderboard.map((item, index) => ({ ...item, key: index }))}
            pagination={false}
            showSorterTooltip={false}
            rowClassName={(record, index) => (index < 3 ? 'highlight-row' : '')}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p>No entries yet. Be the first to complete this challenge!</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeaderboardScreen;