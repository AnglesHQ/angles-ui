'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Content, Panel, Table, Button, Modal, Form, ButtonToolbar, Message, useToaster, SelectPicker, TagPicker } from 'rsuite';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

const { Column, HeaderCell, Cell } = Table;

export default function UsersPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const toaster = useToaster();

    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', userType: 'user', teams: [] });

    const userTypes = [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' }
    ];

    useEffect(() => {
        if (!isLoading && (!user || user.userType !== 'admin')) {
            router.push('/');
        } else if (user && user.userType === 'admin') {
            fetchUsers();
            fetchTeams();
        }
    }, [user, isLoading, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/users');
            setUsers(response.data);
        } catch (error) {
            toaster.push(<Message type="error">Failed to fetch users</Message>, { placement: 'topEnd' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get('/team');
            setTeams(response.data.map(team => ({ label: team.name, value: team._id })));
        } catch (error) {
            console.error('Failed to fetch teams', error);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '', // Do not show existing password
                userType: user.role || 'user',
                teams: user.teams ? user.teams.map(t => typeof t === 'object' ? t._id : t) : []
            });
        } else {
            setEditingUser(null);
            setFormData({ username: '', password: '', userType: 'user', teams: [] });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSaveUser = async () => {
        try {
            const payload = { ...formData, role: formData.userType };
            // delete payload.userType;
            if (editingUser) {
                // Update
                if (!payload.password) delete payload.password; // don't update password if empty
                await axios.put(`/users/${editingUser._id}`, payload);
                toaster.push(<Message type="success">User updated successfully</Message>, { placement: 'topEnd' });
            } else {
                // Create
                await axios.post('/users', payload);
                toaster.push(<Message type="success">User created successfully</Message>, { placement: 'topEnd' });
            }
            fetchUsers();
            handleCloseModal();
        } catch (error) {
            toaster.push(<Message type="error">{error.response?.data?.message || 'Failed to save user'}</Message>, { placement: 'topEnd' });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/users/${userId}`);
                toaster.push(<Message type="success">User deleted successfully</Message>, { placement: 'topEnd' });
                fetchUsers();
            } catch (error) {
                toaster.push(<Message type="error">Failed to delete user</Message>, { placement: 'topEnd' });
            }
        }
    };

    if (isLoading || !user || user.userType !== 'admin') {
        return null;
    }

    return (
        <Container>
            <Content style={{ padding: '20px' }}>
                <Panel header={<span className="about-page-header">User Management</span>} bordered className="about-page-panel">
                    <ButtonToolbar style={{ marginBottom: '20px' }}>
                        <Button appearance="primary" onClick={() => handleOpenModal()}>
                            Add User
                        </Button>
                    </ButtonToolbar>

                    <Table
                        height={400}
                        data={users}
                        loading={loading}
                        hover={false}
                    >
                        <Column width={200} align="center" fixed>
                            <HeaderCell>Username</HeaderCell>
                            <Cell dataKey="username" />
                        </Column>

                        <Column width={150}>
                            <HeaderCell>Role</HeaderCell>
                            <Cell dataKey="role" />
                        </Column>

                        <Column width={300}>
                            <HeaderCell>Teams</HeaderCell>
                            <Cell>
                                {rowData => `${rowData.teams ? rowData.teams.length : 0} teams assigned`}
                            </Cell>
                        </Column>

                        <Column width={200} fixed="right">
                            <HeaderCell>Action</HeaderCell>
                            <Cell>
                                {rowData => (
                                    <span>
                                        <Button appearance="link" onClick={() => handleOpenModal(rowData)}>Edit</Button>
                                        |
                                        <Button appearance="link" color="red" onClick={() => handleDeleteUser(rowData._id)}>Delete</Button>
                                    </span>
                                )}
                            </Cell>
                        </Column>
                    </Table>
                </Panel>
            </Content>

            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Modal.Header>
                    <Modal.Title>{editingUser ? 'Edit User' : 'Add User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form fluid>
                        <Form.Group>
                            <Form.ControlLabel>Username</Form.ControlLabel>
                            <Form.Control
                                name="username"
                                value={formData.username}
                                onChange={(value) => setFormData({ ...formData, username: value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Password {editingUser && '(Leave blank to keep unchanged)'}</Form.ControlLabel>
                            <Form.Control
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(value) => setFormData({ ...formData, password: value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>User Type</Form.ControlLabel>
                            <SelectPicker
                                data={userTypes}
                                value={formData.userType}
                                onChange={(value) => setFormData({ ...formData, userType: value })}
                                block
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Team Access</Form.ControlLabel>
                            <TagPicker
                                data={teams}
                                value={formData.teams}
                                onChange={(value) => setFormData({ ...formData, teams: value })}
                                block
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleSaveUser} appearance="primary">
                        Save
                    </Button>
                    <Button onClick={handleCloseModal} appearance="subtle">
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
