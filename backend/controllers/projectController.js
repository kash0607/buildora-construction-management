import { projectService } from '../services/projectService.js';
import { validateProjectInput } from '../validators/projectValidator.js';

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private
 */
export async function getProjects(req, res, next) {
  try {
    const { status, manager, search, includeArchived } = req.query;
    const projects = await projectService.getProjects({
      status,
      manager,
      search,
      includeArchived: includeArchived === 'true',
    });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export async function getProject(req, res, next) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project '${req.params.id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private (Admin, Project Manager)
 */
export async function createProject(req, res, next) {
  try {
    const validation = validateProjectInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const project = await projectService.createProject(req.body, req.user?._id);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Admin, Project Manager)
 */
export async function updateProject(req, res, next) {
  try {
    const validation = validateProjectInput(req.body, true);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const project = await projectService.updateProject(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project '${req.params.id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Archive project (soft delete)
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin, Project Manager)
 */
export async function deleteProject(req, res, next) {
  try {
    const project = await projectService.archiveProject(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project '${req.params.id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Project '${project.name}' archived successfully`,
      data: project,
    });
  } catch (err) {
    next(err);
  }
}
