import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Content, Panel, Table, Button, Modal, Form, ButtonToolbar, Message, useToaster, SelectPicker, TagPicker } from 'rsuite';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { FormattedMessage, useIntl } from 'react-intl';

import ConfirmModal from '../../common/ConfirmModal';
import PasswordRequirements from '../../common/PasswordRequirements';
import { isPasswordValid } from '../../../utility/PasswordUtilities';
import { getApiErrorMessage } from '../../../utility/ApiUtilities';

const { Column, HeaderCell, Cell } = Table;

export default function AdminUsersPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const toaster = useToaster();
    const intl = useIntl();

    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', userType: 'user', teams: [] });
    const [confirmState, setConfirmState] = useState({ open: false, userId: null });

    const userTypes = [
        { label: intl.formatMessage({ id: 'page.admin.users.user-type.admin' }), value: 'admin' },
        { label: intl.formatMessage({ id: 'page.admin.users.user-type.team_lead' }), value: 'team_lead' },
        { label: intl.formatMessage({ id: 'page.admin.users.user-type.user' }), value: 'user' }
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
            toaster.push(<Message type="error">{intl.formatMessage({ id: 'page.admin.users.toast.fetch-error' })}</Message>, { placement: 'topEnd' });
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

    // Password is required when creating a user, and optional when editing (blank keeps the
    // existing password). Whenever a password IS supplied it must satisfy the strength policy.
    const passwordProvided = formData.password.length > 0;
    const passwordAcceptable = editingUser
        ? (!passwordProvided || isPasswordValid(formData.password))
        : (passwordProvided && isPasswordValid(formData.password));

    const handleSaveUser = async () => {
        if (!passwordAcceptable) {
            toaster.push(<Message type="warning">{intl.formatMessage({ id: 'password.policy.invalid' })}</Message>, { placement: 'topEnd' });
            return;
        }
        try {
            const payload = { ...formData, role: formData.userType };
            // delete payload.userType;
            if (editingUser) {
                // Update
                if (!payload.password) delete payload.password; // don't update password if empty
                await axios.put(`/users/${editingUser._id}`, payload);
                toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.admin.users.toast.update-success' })}</Message>, { placement: 'topEnd' });
            } else {
                // Create
                await axios.post('/users', payload);
                toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.admin.users.toast.create-success' })}</Message>, { placement: 'topEnd' });
            }
            fetchUsers();
            handleCloseModal();
        } catch (error) {
            toaster.push(<Message type="error">{getApiErrorMessage(error, intl.formatMessage({ id: 'page.admin.users.toast.save-error' }))}</Message>, { placement: 'topEnd' });
        }
    };

    const handleDeleteUser = async (userId) => {
        setConfirmState({ open: true, userId });
    };

    const handleConfirmDelete = async () => {
        const { userId } = confirmState;
        setConfirmState({ open: false, userId: null });
        try {
            await axios.delete(`/users/${userId}`);
            toaster.push(<Message type="success">{intl.formatMessage({ id: 'page.admin.users.toast.delete-success' })}</Message>, { placement: 'topEnd' });
            fetchUsers();
        } catch (error) {
            toaster.push(<Message type="error">{intl.formatMessage({ id: 'page.admin.users.toast.delete-error' })}</Message>, { placement: 'topEnd' });
        }
    };

    const handleCancelDelete = () => {
        setConfirmState({ open: false, userId: null });
    };

    if (isLoading || !user || user.userType !== 'admin') {
        return null;
    }

    return (
        <Container>
            <Content className="page">
                <Panel
                    header={<span className="page-panel-header"><FormattedMessage id="page.admin.users.header" /></span>}
                    bordered
                    className="page-panel"
                >
                    <ButtonToolbar className="page-toolbar">
                        <Button className="btn-primary" onClick={() => handleOpenModal()}>
                            <FormattedMessage id="page.admin.users.button.add-user" />
                        </Button>
                    </ButtonToolbar>

                    <Table
                        height={400}
                        data={users}
                        loading={loading}
                        hover={false}
                    >
                        <Column width={200} align="center" fixed>
                            <HeaderCell><FormattedMessage id="page.admin.users.table.username" /></HeaderCell>
                            <Cell dataKey="username" />
                        </Column>

                        <Column width={150}>
                            <HeaderCell><FormattedMessage id="page.admin.users.table.role" /></HeaderCell>
                            <Cell dataKey="role" />
                        </Column>

                        <Column width={300}>
                            <HeaderCell><FormattedMessage id="page.admin.users.table.teams" /></HeaderCell>
                            <Cell>
                                {rowData => intl.formatMessage({ id: 'page.admin.users.table.teams-assigned' }, { count: rowData.teams ? rowData.teams.length : 0 })}
                            </Cell>
                        </Column>

                        <Column width={200} fixed="right">
                            <HeaderCell><FormattedMessage id="page.user-settings.table.action" /></HeaderCell>
                            <Cell>
                                {rowData => (
                                    <span>
                                        <Button
                                            appearance="link"
                                            className="link-action"
                                            onClick={() => handleOpenModal(rowData)}
                                        >
                                            <FormattedMessage id="page.admin.users.table.edit" />
                                        </Button>
                                        <span className="link-separator">|</span>
                                        <Button
                                            appearance="link"
                                            className="link-danger"
                                            onClick={() => handleDeleteUser(rowData._id)}
                                        >
                                            <FormattedMessage id="page.admin.users.table.delete" />
                                        </Button>
                                    </span>
                                )}
                            </Cell>
                        </Column>
                    </Table>
                </Panel>
            </Content>

            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Modal.Header>
                    <Modal.Title>{editingUser ? <FormattedMessage id="page.admin.users.modal.edit-user" /> : <FormattedMessage id="page.admin.users.modal.add-user" />}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form fluid>
                        <Form.Group>
                            <Form.ControlLabel><FormattedMessage id="page.admin.users.table.username" /></Form.ControlLabel>
                            <Form.Control
                                name="username"
                                value={formData.username}
                                onChange={(value) => setFormData({ ...formData, username: value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel><FormattedMessage id="page.admin.users.modal.password-label" /> {editingUser && <FormattedMessage id="page.admin.users.modal.password-help" />}</Form.ControlLabel>
                            <Form.Control
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(value) => setFormData({ ...formData, password: value })}
                            />
                            {formData.password.length > 0 && (
                                <PasswordRequirements password={formData.password} />
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel><FormattedMessage id="page.admin.users.modal.user-type" /></Form.ControlLabel>
                            <SelectPicker
                                data={userTypes}
                                value={formData.userType}
                                onChange={(value) => setFormData({ ...formData, userType: value })}
                                block
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel><FormattedMessage id="page.admin.users.modal.team-access" /></Form.ControlLabel>
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
                    <Button className="btn-primary" onClick={handleSaveUser} disabled={!passwordAcceptable}>
                        <FormattedMessage id="page.admin.users.button.save" />
                    </Button>
                    <Button
                        className="btn-secondary"
                        onClick={handleCloseModal}
                    >
                        <FormattedMessage id="page.admin.users.button.cancel" />
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                open={confirmState.open}
                title={<FormattedMessage id="page.admin.users.confirm.delete.title" />}
                message={<FormattedMessage id="page.admin.users.confirm.delete.message" />}
                confirmLabel={<FormattedMessage id="page.admin.users.table.delete" />}
                cancelLabel={<FormattedMessage id="page.admin.users.button.cancel" />}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </Container>
    );
}
